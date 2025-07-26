import { NextRequest, NextResponse } from 'next/server';
import { hdfcPaymentService } from '@/lib/hdfc-payment';
import { HDFCWebhookEvent } from '@/lib/types/payment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('HDFC Webhook received:', body);

    // Verify webhook signature
    const isSignatureValid = hdfcPaymentService.verifyWebhookSignature(body);
    
    if (!isSignatureValid) {
      console.error('Invalid HDFC webhook signature:', {
        order_id: body.order_id,
        signature: body.signature
      });
      
      return NextResponse.json(
        { status: 'error', message: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Process webhook event
    const event: HDFCWebhookEvent = body;
    
    console.log('Processing HDFC webhook event:', {
      event_type: event.event_type,
      order_id: event.order_id,
      status: event.status,
      amount: event.amount
    });

    // Handle different event types
    switch (event.event_type) {
      case 'success':
        await handleSuccessEvent(event);
        break;
      
      case 'failed':
        await handleFailedEvent(event);
        break;
      
      case 'pending':
        await handlePendingEvent(event);
        break;
      
      case 'refunded':
        await handleRefundedEvent(event);
        break;
      
      default:
        console.warn('Unknown HDFC webhook event type:', event.event_type);
    }

    // Return success response to HDFC
    return NextResponse.json({
      status: 'success',
      message: 'Webhook processed successfully'
    });

  } catch (error) {
    console.error('HDFC webhook processing error:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to process webhook'
      },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment webhook
 */
async function handleSuccessEvent(event: HDFCWebhookEvent) {
  try {
    console.log('Processing successful payment webhook:', event.order_id);
    
    // Update database with successful payment
    // Example: await updatePaymentStatus(event.order_id, 'completed');
    
    // Send confirmation email
    // Example: await sendPaymentConfirmationEmail(event);
    
    // Trigger fulfillment process
    // Example: await triggerFulfillment(event.order_id);
    
    console.log('Success webhook processed for order:', event.order_id);
  } catch (error) {
    console.error('Error processing success webhook:', error);
    throw error;
  }
}

/**
 * Handle failed payment webhook
 */
async function handleFailedEvent(event: HDFCWebhookEvent) {
  try {
    console.log('Processing failed payment webhook:', event.order_id);
    
    // Update database with failed payment
    // Example: await updatePaymentStatus(event.order_id, 'failed');
    
    // Send failure notification
    // Example: await sendPaymentFailureEmail(event);
    
    console.log('Failed webhook processed for order:', event.order_id);
  } catch (error) {
    console.error('Error processing failed webhook:', error);
    throw error;
  }
}

/**
 * Handle pending payment webhook
 */
async function handlePendingEvent(event: HDFCWebhookEvent) {
  try {
    console.log('Processing pending payment webhook:', event.order_id);
    
    // Update database with pending status
    // Example: await updatePaymentStatus(event.order_id, 'pending');
    
    console.log('Pending webhook processed for order:', event.order_id);
  } catch (error) {
    console.error('Error processing pending webhook:', error);
    throw error;
  }
}

/**
 * Handle refund webhook
 */
async function handleRefundedEvent(event: HDFCWebhookEvent) {
  try {
    console.log('Processing refund webhook:', event.order_id);
    
    // Update database with refund status
    // Example: await updatePaymentStatus(event.order_id, 'refunded');
    
    // Send refund confirmation
    // Example: await sendRefundConfirmationEmail(event);
    
    console.log('Refund webhook processed for order:', event.order_id);
  } catch (error) {
    console.error('Error processing refund webhook:', error);
    throw error;
  }
} 