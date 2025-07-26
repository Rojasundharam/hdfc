// HDFC SmartGateway Payment Types

export interface HDFCPaymentSession {
  order_id: string;
  amount: string;
  customer_id: string;
  customer_email: string;
  customer_phone: string;
  payment_page_client_id: string;
  return_url: string;
  description: string;
  first_name: string;
  last_name: string;
}

export interface HDFCSessionResponse {
  session_id?: string; // May be undefined in HDFC response
  order_id: string;
  payment_links?: {
    web: string;
    mobile: string;
  };
  redirect_url?: string; // HDFC may return direct redirect URL
}

export interface HDFCPaymentResponse {
  order_id: string;
  status: 'CHARGED' | 'FAILED' | 'PENDING'; // HDFC uses uppercase
  status_id?: string;
  transaction_id?: string;
  amount?: string;
  payment_method?: string;
  bank_ref_no?: string;
  merchant_id?: string;
  signature: string;
  signature_algorithm?: string;
  gateway_transaction_id?: string;
  payment_gateway?: string;
  response_code?: string;
  response_message?: string;
  created_at?: string;
}

export interface HDFCRefundRequest {
  order_id: string;
  refund_amount: string;
  refund_note?: string;
}

export interface HDFCRefundResponse {
  refund_id: string;
  order_id: string;
  refund_amount: string;
  status: 'success' | 'failed' | 'pending';
  created_at: string;
}

export interface PaymentFormData {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description?: string;
}

export interface PaymentStatusRequest {
  order_id: string;
}

export interface PaymentStatusResponse {
  order_id: string;
  status: string;
  amount: string;
  transaction_id?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export type PaymentEnvironment = 'sandbox' | 'production';

export interface HDFCConfig {
  apiKey: string;
  merchantId: string;
  paymentPageClientId: string;
  responseKey: string;
  environment: PaymentEnvironment;
  baseUrl: string;
  returnUrl: string;
  successUrl: string;
  cancelUrl: string;
}

// EXACT HDFC Order Status Response - matching the official documentation
export interface HDFCOrderStatusResponse {
  order_id: string;
  order_status: "charged" | "failed" | "pending" | "declined" | "cancelled" | "refunded";
  status_id: string;
  transaction_id: string;
  amount: string; // String format in HDFC API
  payment_method: string;
  bank_ref_no: string;
  customer_id: string;
  merchant_id: string;
  created_at: string; // ISO 8601 format
  updated_at: string; // ISO 8601 format
  currency: string;
  gateway_response: {
    gateway_transaction_id: string;
    auth_code: string;
    rrn: string;
  };
}

export interface HDFCRefundResponse {
  refund_id: string;
  order_id: string;
  refund_amount: string;
  refund_ref_no: string;
  status: 'success' | 'failed' | 'pending';
  created_at: string;
}

export interface HDFCWebhookEvent {
  event_type: 'success' | 'failed' | 'pending' | 'refunded';
  order_id: string;
  status: string;
  amount: string;
  transaction_id?: string;
  signature: string;
  timestamp: string;
} 