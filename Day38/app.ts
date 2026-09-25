import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {requireEnv, createSignature, safeEqual} from "./utils/helper.ts"
import type {InitiatePaymentBody, PaymentData, EsewaCallbackData} from "./types/appTypes.d.ts"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = Number(process.env.PORT) || 5000;

// 1. Generate parameters and signature for the frontend form
app.post(
  '/api/payment/initiate',
  (req: Request<{}, {}, InitiatePaymentBody>, res: Response) => {
    try {
      const { amount, transaction_uuid } = req.body;

      if (!amount || !transaction_uuid) {
        return res
          .status(400)
          .json({ error: 'amount and transaction_uuid are required.' });
      }

      const product_code = requireEnv('ESEWA_PRODUCT_CODE');
      const secret_key = requireEnv('ESEWA_SECRET_KEY');

      // total_amount must equal amount + tax + charges (all zero here)
      const total_amount = String(amount);

      const signatureString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
      const signature = createSignature(signatureString, secret_key);

      const paymentData: PaymentData = {
        amount: String(amount),
        failure_url: requireEnv('FAILURE_URL'),
        product_delivery_charge: '0',
        product_service_charge: '0',
        product_code,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        success_url: requireEnv('SUCCESS_URL'),
        tax_amount: '0',
        total_amount,
        transaction_uuid,
        signature,
        esewa_url: requireEnv('ESEWA_INITIATE_URL'),
      };

      return res.status(200).json(paymentData);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({ error: message });
    }
  }
);

// 2. Success URL handler - eSewa redirects here after successful payment
app.get('/payment-success', (req: Request, res: Response) => {
  try {
    const encodedData = req.query.data;
    if (typeof encodedData !== 'string' || !encodedData) {
      return res.status(400).send('Invalid response data from eSewa.');
    }

    const decodedString = Buffer.from(encodedData, 'base64').toString('utf-8');
    const decodedData: EsewaCallbackData = JSON.parse(decodedString);

    const { signed_field_names, signature } = decodedData;
    if (!signed_field_names || !signature) {
      return res.status(400).send('Malformed eSewa response.');
    }

    // Rebuild the signed message from the fields eSewa says it signed, in order
    const fields = signed_field_names.split(',');
    if (fields.some((field) => decodedData[field] === undefined)) {
      return res.status(400).send('Malformed eSewa response.');
    }
    const message = fields.map((field) => `${field}=${decodedData[field]}`).join(',');

    const expectedHash = createSignature(message, requireEnv('ESEWA_SECRET_KEY'));

    if (!safeEqual(expectedHash, signature)) {
      return res
        .status(400)
        .send('Signature verification failed. Data tampering detected!');
    }

    if (decodedData.status !== 'COMPLETE') {
      return res.status(400).json({
        message: 'Payment not completed.',
        status: decodedData.status,
      });
    }

    // TODO: look up the order by transaction_uuid, confirm total_amount matches,
    // then update your database here.

    return res.status(200).json({
      message: 'Payment successfully verified!',
      transaction_details: decodedData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).send('Internal Server Error: ' + message);
  }
});

// 3. Failure URL handler - eSewa redirects here if the payment fails or is cancelled
app.get('/payment-failure', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Payment failed or was cancelled by the user.',
    status: 'FAILED',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
