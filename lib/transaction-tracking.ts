import { createClient } from '@/lib/utils/supabase/client';
import { Database } from './database.types';

type PaymentSession = Database['public']['Tables']['payment_sessions']['Row'];
type TransactionDetail = Database['public']['Tables']['transaction_details']['Row'];
type PaymentStatusHistory = Database['public']['Tables']['payment_status_history']['Row'];
type SecurityAuditLog = Database['public']['Tables']['security_audit_log']['Row'];
type BankTestCase = Database['public']['Tables']['bank_test_cases']['Row'];

export interface CreatePaymentSessionParams {
  orderId: string;
  customerId: string;
  customerEmail: string;
  customerPhone?: string;
  firstName?: string;
  lastName?: string;
  amount?: number;
  currency?: string;
  description?: string;
  serviceId?: string;
  userId?: string;
  testCaseId?: string;
  testScenario?: string;
}

export interface RecordTransactionParams {
  orderId: string;
  transactionId?: string;
  paymentSessionId?: string;
  status?: string;
  hdfcResponse?: any;
  formData?: any;
  signatureData?: {
    signature?: string;
    verified?: boolean;
    algorithm?: string;
  };
  testCaseId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SecurityEventParams {
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  orderId?: string;
  vulnerabilityType?: string;
  eventData?: any;
  testCaseId?: string;
}

export class TransactionTrackingService {
  private supabase = createClient();

  /**
   * Create a new payment session with full tracking
   */
  async createPaymentSession(params: CreatePaymentSessionParams): Promise<string> {
    try {
      const { data, error } = await this.supabase.rpc('create_tracked_payment_session', {
        p_order_id: params.orderId,
        p_customer_id: params.customerId,
        p_customer_email: params.customerEmail,
        p_customer_phone: params.customerPhone || null,
        p_first_name: params.firstName || null,
        p_last_name: params.lastName || null,
        p_amount: params.amount || null,
        p_currency: params.currency || 'INR',
        p_description: params.description || null,
        p_service_id: params.serviceId || null,
        p_user_id: params.userId || null,
        p_test_case_id: params.testCaseId || null,
        p_test_scenario: params.testScenario || null
      });

      if (error) {
        console.error('Error creating payment session:', error);
        throw new Error(`Failed to create payment session: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Transaction tracking error:', error);
      throw error;
    }
  }

  /**
   * Record transaction response with complete details
   */
  async recordTransactionResponse(params: RecordTransactionParams): Promise<string> {
    try {
      const { data, error } = await this.supabase.rpc('record_transaction_response', {
        p_order_id: params.orderId,
        p_transaction_id: params.transactionId || null,
        p_payment_session_id: params.paymentSessionId || null,
        p_status: params.status || null,
        p_hdfc_response: params.hdfcResponse || null,
        p_form_data: params.formData || null,
        p_signature_data: params.signatureData || null,
        p_test_case_id: params.testCaseId || null,
        p_ip_address: params.ipAddress || null,
        p_user_agent: params.userAgent || null
      });

      if (error) {
        console.error('Error recording transaction response:', error);
        throw new Error(`Failed to record transaction: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Transaction recording error:', error);
      throw error;
    }
  }

  /**
   * Log security events and vulnerabilities
   */
  async logSecurityEvent(params: SecurityEventParams): Promise<string> {
    try {
      const { data, error } = await this.supabase.rpc('log_security_event', {
        p_event_type: params.eventType,
        p_severity: params.severity,
        p_description: params.description,
        p_order_id: params.orderId || null,
        p_vulnerability_type: params.vulnerabilityType || null,
        p_event_data: params.eventData || null,
        p_test_case_id: params.testCaseId || null
      });

      if (error) {
        console.error('Error logging security event:', error);
        throw new Error(`Failed to log security event: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Security logging error:', error);
      throw error;
    }
  }

  /**
   * Update HDFC session response
   */
  async updateSessionResponse(orderId: string, sessionData: any): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('payment_sessions')
        .update({
          session_id: sessionData.session_id,
          payment_link_web: sessionData.payment_links?.web,
          payment_link_mobile: sessionData.payment_links?.mobile,
          hdfc_session_response: sessionData,
          session_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (error) {
        throw new Error(`Failed to update session response: ${error.message}`);
      }
    } catch (error) {
      console.error('Session update error:', error);
      throw error;
    }
  }

  /**
   * Get payment session by order ID
   */
  async getPaymentSession(orderId: string): Promise<PaymentSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('payment_sessions')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No record found
        }
        throw new Error(`Failed to get payment session: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Get payment session error:', error);
      throw error;
    }
  }

  /**
   * Get transaction details by order ID
   */
  async getTransactionDetails(orderId: string): Promise<TransactionDetail[]> {
    try {
      const { data, error } = await this.supabase
        .from('transaction_details')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get transaction details: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get transaction details error:', error);
      throw error;
    }
  }

  /**
   * Get security audit logs for order
   */
  async getSecurityAuditLogs(orderId: string): Promise<SecurityAuditLog[]> {
    try {
      const { data, error } = await this.supabase
        .from('security_audit_log')
        .select('*')
        .eq('order_id', orderId)
        .order('detected_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get security logs: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get security logs error:', error);
      throw error;
    }
  }

  /**
   * Get all bank test cases
   */
  async getBankTestCases(): Promise<BankTestCase[]> {
    try {
      const { data, error } = await this.supabase
        .from('bank_test_cases')
        .select('*')
        .order('test_case_id');

      if (error) {
        throw new Error(`Failed to get test cases: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get test cases error:', error);
      throw error;
    }
  }

  /**
   * Update test case results
   */
  async updateTestCaseResult(
    testCaseId: string, 
    result: {
      status?: string;
      actualResult?: string;
      testOutput?: any;
      errorMessages?: string;
      vulnerabilitiesFound?: string;
      executionDuration?: string;
    }
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('bank_test_cases')
        .update({
          test_status: result.status,
          actual_result: result.actualResult,
          test_output: result.testOutput,
          error_messages: result.errorMessages,
          vulnerabilities_found: result.vulnerabilitiesFound,
          execution_date: new Date().toISOString(),
          execution_duration: result.executionDuration,
          updated_at: new Date().toISOString()
        })
        .eq('test_case_id', testCaseId);

      if (error) {
        throw new Error(`Failed to update test case: ${error.message}`);
      }
    } catch (error) {
      console.error('Update test case error:', error);
      throw error;
    }
  }

  /**
   * Create hash verification record
   */
  async createHashVerification(
    orderId: string,
    transactionId: string,
    hashData: {
      hashType: string;
      originalData: string;
      computedHash: string;
      receivedHash?: string;
      verified?: boolean;
      algorithm?: string;
      testCaseReference?: string;
    }
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('hash_verification')
        .insert({
          order_id: orderId,
          transaction_id: transactionId,
          hash_type: hashData.hashType,
          original_data: hashData.originalData,
          computed_hash: hashData.computedHash,
          received_hash: hashData.receivedHash,
          hash_verified: hashData.verified || false,
          verification_algorithm: hashData.algorithm,
          test_case_reference: hashData.testCaseReference,
          generated_at: new Date().toISOString()
        });

      if (error) {
        throw new Error(`Failed to create hash verification: ${error.message}`);
      }
    } catch (error) {
      console.error('Hash verification error:', error);
      throw error;
    }
  }

  /**
   * Get complete transaction audit trail
   */
  async getTransactionAuditTrail(orderId: string): Promise<{
    paymentSession: PaymentSession | null;
    transactions: TransactionDetail[];
    statusHistory: PaymentStatusHistory[];
    securityLogs: SecurityAuditLog[];
  }> {
    try {
      const [paymentSession, transactions, statusHistory, securityLogs] = await Promise.all([
        this.getPaymentSession(orderId),
        this.getTransactionDetails(orderId),
        this.getPaymentStatusHistory(orderId),
        this.getSecurityAuditLogs(orderId)
      ]);

      return {
        paymentSession,
        transactions,
        statusHistory,
        securityLogs
      };
    } catch (error) {
      console.error('Get audit trail error:', error);
      throw error;
    }
  }

  /**
   * Get payment status history
   */
  private async getPaymentStatusHistory(orderId: string): Promise<PaymentStatusHistory[]> {
    try {
      const { data, error } = await this.supabase
        .from('payment_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('changed_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get status history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get status history error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const transactionTrackingService = new TransactionTrackingService(); 