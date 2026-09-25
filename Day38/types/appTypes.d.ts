
interface InitiatePaymentBody {
  amount?: string | number;
  transaction_uuid?: string;
}

interface PaymentData {
  amount: string;
  failure_url: string;
  product_delivery_charge: string;
  product_service_charge: string;
  product_code: string;
  signed_field_names: string;
  success_url: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  signature: string;
  esewa_url: string;
}

interface EsewaCallbackData {
  transaction_code?: string;
  status?: string;
  total_amount?: string;
  transaction_uuid?: string;
  product_code?: string;
  signed_field_names: string;
  signature: string;
  [key: string]: string | undefined;
}


export {InitiatePaymentBody, PaymentData, EsewaCallbackData}
