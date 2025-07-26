import { NextRequest, NextResponse } from 'next/server';
import { hdfcPaymentService } from '@/lib/hdfc-payment';

// GET method for order status (HDFC API requirement)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get('order_id');

    if (!order_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: order_id' },
        { status: 400 }
      );
    }

    console.log('Checking HDFC payment status for order:', order_id);

    // Get payment status from HDFC
    const statusResponse = await hdfcPaymentService.getPaymentStatus(order_id);

    console.log('HDFC payment status response (from docs format):', {
      order_id: statusResponse.order_id,
      order_status: statusResponse.order_status,      // HDFC docs use "order_status" 
      transaction_id: statusResponse.transaction_id,  // HDFC docs use "transaction_id"
      amount: statusResponse.amount,                  // String format
      currency: statusResponse.currency,
      payment_method: statusResponse.payment_method,
      created_at: statusResponse.created_at,
      updated_at: statusResponse.updated_at
    });

    // Return the HDFC response with proper field mapping for backward compatibility
    return NextResponse.json({
      success: true,
      payment_status: {
        // Map HDFC fields to our expected format for backward compatibility
        order_id: statusResponse.order_id,
        status: statusResponse.order_status,           // Map order_status to status
        transaction_id: statusResponse.transaction_id, // Use transaction_id from HDFC docs
        amount: statusResponse.amount,
        currency: statusResponse.currency,
        payment_method: statusResponse.payment_method,
        bank_ref_no: statusResponse.bank_ref_no,
        customer_id: statusResponse.customer_id,
        merchant_id: statusResponse.merchant_id,
        created_at: statusResponse.created_at,
        updated_at: statusResponse.updated_at,
        // Additional fields from HDFC docs
        status_id: statusResponse.status_id,
        gateway_response: statusResponse.gateway_response
      },
      // Also include the raw HDFC response for reference
      hdfc_response: statusResponse,
    });

  } catch (error) {
    console.error('HDFC payment status check error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to check payment status',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// POST method for backward compatibility
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id } = body;

    if (!order_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: order_id' },
        { status: 400 }
      );
    }

    console.log('Checking HDFC payment status (POST) for order:', order_id);

    // Get payment status from HDFC
    const statusResponse = await hdfcPaymentService.getPaymentStatus(order_id);

    console.log('HDFC payment status response (POST, from docs format):', {
      order_id: statusResponse.order_id,
      order_status: statusResponse.order_status,      // HDFC docs use "order_status"
      transaction_id: statusResponse.transaction_id,  // HDFC docs use "transaction_id"
      amount: statusResponse.amount,                  // String format
      currency: statusResponse.currency
    });

    // Return the HDFC response with proper field mapping for backward compatibility
    return NextResponse.json({
      success: true,
      payment_status: {
        // Map HDFC fields to our expected format for backward compatibility
        order_id: statusResponse.order_id,
        status: statusResponse.order_status,           // Map order_status to status
        transaction_id: statusResponse.transaction_id, // Use transaction_id from HDFC docs
        amount: statusResponse.amount,
        currency: statusResponse.currency,
        payment_method: statusResponse.payment_method,
        bank_ref_no: statusResponse.bank_ref_no,
        customer_id: statusResponse.customer_id,
        merchant_id: statusResponse.merchant_id,
        created_at: statusResponse.created_at,
        updated_at: statusResponse.updated_at,
        // Additional fields from HDFC docs
        status_id: statusResponse.status_id,
        gateway_response: statusResponse.gateway_response
      },
      // Also include the raw HDFC response for reference
      hdfc_response: statusResponse,
    });

  } catch (error) {
    console.error('HDFC payment status check (POST) error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to check payment status',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 