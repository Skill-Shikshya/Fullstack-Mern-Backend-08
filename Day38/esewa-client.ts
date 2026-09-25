// esewa-client.ts (frontend)

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

const API_BASE = 'http://localhost:5000';

export async function payWithEsewa(amount: number): Promise<void> {
  // Unique per attempt. eSewa allows letters, numbers and hyphens.
  const transaction_uuid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // 1. Ask your backend for the signed parameters (normal fetch is fine here)
  const res = await fetch(`${API_BASE}/api/payment/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, transaction_uuid }),
  });

  if (!res.ok) {
    throw new Error((await res.json()).error ?? 'Failed to initiate payment');
  }

  const { esewa_url, ...fields }: PaymentData = await res.json();

  // 2. Build a real HTML form and submit it. This must be a browser form POST
  //    (not fetch/axios) because eSewa responds with a page/redirect that the
  //    browser has to navigate to.
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = esewa_url;

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

// Usage (React example):
// <button onClick={() => payWithEsewa(100)}>Pay with eSewa</button>
