import crypto from 'crypto';
import {
  HDFCConfig,
  HDFCPaymentSession,
  HDFCSessionResponse,
  HDFCPaymentResponse,
  HDFCRefundRequest,
  HDFCRefundResponse,
  HDFCOrderStatusResponse,
  HDFCWebhookEvent,
  PaymentEnvironment,
} from './types/payment';

class HDFCPaymentService {
  private config: HDFCConfig;

  constructor() {
    this.config = this.getConfig();
  }

  /**
   * Get payment status from HDFC - exact API format matching documentation
   */
  async getPaymentStatus(orderId: string): Promise<HDFCOrderStatusResponse> {
    this.validateConfig();

    try {
      // Generate customer_id for header (required by HDFC API)
      const customerId = this.generateCustomerId(orderId);

      // Use exact headers from HDFC documentation
      const response = await fetch(`${this.config.baseUrl}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(), // Basic base_64_encoded_api_key
          'Content-Type': 'application/json',    // Required by HDFC docs
          'version': '2023-06-30',               // Required API version
          'x-merchantid': this.config.merchantId, // Required by HDFC docs
          'x-customerid': customerId,            // Required by HDFC docs
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HDFC Order Status API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText,
          orderId,
          headers: {
            'Authorization': 'Basic [REDACTED]',
            'Content-Type': 'application/json',
            'version': '2023-06-30',
            'x-merchantid': this.config.merchantId,
            'x-customerid': customerId
          }
        });
        throw new Error(`HDFC API Error: ${response.status} - ${errorText}`);
      }

      const data: HDFCOrderStatusResponse = await response.json();
      
      console.log('HDFC Order Status Response (from docs format):', {
        order_id: data.order_id,
        order_status: data.order_status,        // HDFC uses "order_status"
        transaction_id: data.transaction_id,    // HDFC uses "transaction_id"
        amount: data.amount,                    // String format
        currency: data.currency,
        payment_method: data.payment_method,
        created_at: data.created_at,
        updated_at: data.updated_at,
        gateway_response: data.gateway_response
      });

      return data;
    } catch (error) {
      console.error('Get payment status error:', error);
      throw new Error(`Failed to get payment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get configuration with environment variable support for URLs
   */
  private getConfig(): HDFCConfig {
    const environment = (process.env.HDFC_ENVIRONMENT as PaymentEnvironment) || 'sandbox';
    
    // Support environment variables for URLs (as per HDFC docs)
    const baseUrls = {
      sandbox: process.env.HDFC_SANDBOX_URL || 'https://smartgatewayuat.hdfcbank.com',
      production: process.env.HDFC_PRODUCTION_URL || 'https://smartgateway.hdfcbank.com'
    };
    
    // Get base app URL with fallbacks
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return {
      apiKey: process.env.HDFC_API_KEY!,
      merchantId: process.env.HDFC_MERCHANT_ID!,
      paymentPageClientId: process.env.HDFC_PAYMENT_PAGE_CLIENT_ID || process.env.HDFC_MERCHANT_ID!,
      responseKey: process.env.HDFC_RESPONSE_KEY!,
      environment,
      baseUrl: baseUrls[environment],
      returnUrl: process.env.PAYMENT_RETURN_URL || `${appUrl}/api/payment/response`,
      successUrl: process.env.PAYMENT_SUCCESS_URL || `${appUrl}/payment/success`,
      cancelUrl: process.env.PAYMENT_CANCEL_URL || `${appUrl}/payment/cancel`
    };
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (!this.config.apiKey || !this.config.merchantId || !this.config.responseKey) {
      throw new Error('Missing HDFC configuration. Please check your environment variables.');
    }
  }

  /**
   * Generate unique order ID
   */
  generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `ORD${timestamp}${random}`;
  }

  /**
   * Generate customer ID with email hash
   */
  generateCustomerId(customerEmail: string): string {
    const timestamp = Date.now();
    const emailHash = crypto.createHash('md5').update(customerEmail).digest('hex').substring(0, 8);
    return `CUST${emailHash}${timestamp}`;
  }

  /**
   * Create Basic Auth header with Base64 encoded API key
   */
  private getAuthHeader(): string {
    const credentials = Buffer.from(this.config.apiKey + ':').toString('base64');
    return `Basic ${credentials}`;
  }

  /**
   * HDFC's Exact Signature Verification Algorithm
   */
  verifySignature(params: Record<string, any>): boolean {
    try {
      const receivedSignature = params.signature;
      if (!receivedSignature) {
        console.error('No signature found in payment response');
        return false;
      }

      // Step 1: Filter out signature and signature_algorithm from params
      const filteredParams = { ...params };
      delete filteredParams.signature;
      delete filteredParams.signature_algorithm;

      // Step 2: Sort parameters alphabetically by key
      const sortedKeys = Object.keys(filteredParams).sort();

      // Step 3: Create URL-encoded parameter string: key=value&key=value
      const paramString = sortedKeys
        .map(key => `${key}=${filteredParams[key]}`)
        .join('&');

      // Step 4: URL encode the entire parameter string
      const encodedParamString = encodeURIComponent(paramString);

      // Step 5: HMAC-SHA256 with Response Key, output as base64
      const computedHash = crypto
        .createHmac('sha256', this.config.responseKey)
        .update(encodedParamString)
        .digest('base64');

      // Step 6: URL encode the computed hash
      const encodedComputedHash = encodeURIComponent(computedHash);

      console.log('HDFC Signature Verification:', {
        paramString,
        encodedParamString,
        computedHash,
        encodedComputedHash,
        receivedSignature,
        receivedSignatureDecoded: decodeURIComponent(receivedSignature)
      });

      // Step 7: Compare with received signature (both encoded and decoded)
      return receivedSignature === encodedComputedHash || 
             decodeURIComponent(receivedSignature) === computedHash;

    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Create payment session
   */
  async createPaymentSession(sessionData: HDFCPaymentSession): Promise<HDFCSessionResponse> {
    this.validateConfig();

    try {
      const apiUrl = `${this.config.baseUrl}/session`;
      
      // Debug logging to identify the issue
      console.log('HDFC Payment Session Debug:', {
        apiUrl,
        baseUrl: this.config.baseUrl,
        environment: this.config.environment,
        merchantId: this.config.merchantId,
        hasApiKey: !!this.config.apiKey,
        customerId: sessionData.customer_id,
        orderId: sessionData.order_id,
        amount: sessionData.amount
      });

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': this.getAuthHeader(),
        'x-merchantid': this.config.merchantId,
        'x-customerid': sessionData.customer_id,
      };

      console.log('HDFC Request Headers:', {
        'Content-Type': headers['Content-Type'],
        'Authorization': headers.Authorization ? 'Basic [REDACTED]' : 'Missing',
        'x-merchantid': headers['x-merchantid'],
        'x-customerid': headers['x-customerid']
      });

      console.log('HDFC Request Body:', sessionData);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(sessionData),
      });

      console.log('HDFC Response Status:', response.status);
      console.log('HDFC Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HDFC API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          url: apiUrl,
          errorBody: errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`HDFC API Error: ${response.status} - ${errorText}`);
      }

      const data: HDFCSessionResponse = await response.json();
      
      console.log('HDFC Session Response:', data);
      
      // Handle undefined session_id in response
      if (!data.session_id && !data.redirect_url) {
        console.warn('HDFC response missing session_id and redirect_url');
      }

      return data;
    } catch (error) {
      console.error('Create payment session error:', error);
      throw new Error(`Failed to create payment session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process refund
   */
  async processRefund(refundData: HDFCRefundRequest): Promise<HDFCRefundResponse> {
    this.validateConfig();

    const refundRefNo = `REF${Date.now()}${Math.floor(Math.random() * 1000)}`;

    try {
      const payload = {
        ...refundData,
        refund_ref_no: refundRefNo,
        merchant_id: this.config.merchantId,
      };

      const response = await fetch(`${this.config.baseUrl}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.getAuthHeader(),
          'x-merchantid': this.config.merchantId,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HDFC API Error: ${response.status} - ${errorText}`);
      }

      const data: HDFCRefundResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Process refund error:', error);
      throw new Error(`Failed to process refund: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(event: HDFCWebhookEvent): boolean {
    return this.verifySignature(event as any);
  }

  /**
   * Format amount for HDFC (always 2 decimal places)
   */
  formatAmount(amount: number): string {
    return amount.toFixed(2);
  }

  /**
   * Parse customer name into first and last name
   */
  parseCustomerName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || parts[0] || ''
    };
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    // Indian phone number validation (10 digits, may start with +91)
    const phoneRegex = /^(\+91[-\s]?)?[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  }

  /**
   * Format phone number for HDFC
   */
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/[\s-]/g, '');
    if (cleaned.startsWith('+91')) {
      return cleaned;
    }
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return `+${cleaned}`;
    }
    if (cleaned.length === 10) {
      return `+91 ${cleaned}`;
    }
    return phone;
  }

  /**
   * Get return URL for payment response
   */
  getReturnUrl(): string {
    return this.config.returnUrl;
  }

  /**
   * Get success URL
   */
  getSuccessUrl(): string {
    return this.config.successUrl;
  }

  /**
   * Get cancel URL
   */
  getCancelUrl(): string {
    return this.config.cancelUrl;
  }

  /**
   * Map HDFC status values to our internal format
   */
  private mapHdfcStatus(hdfcStatus: string): string {
    const statusMapping: Record<string, string> = {
      'charged': 'CHARGED',
      'failed': 'FAILED', 
      'pending': 'PENDING',
      'declined': 'DECLINED',
      'cancelled': 'CANCELLED',
      'refunded': 'REFUNDED'
    };
    
    return statusMapping[hdfcStatus.toLowerCase()] || hdfcStatus.toUpperCase();
  }
}

// Export singleton instance
export const hdfcPaymentService = new HDFCPaymentService();

// Export class for testing
export { HDFCPaymentService }; 