import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Use service role key for admin operations
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Service role key not configured. Please add SUPABASE_SERVICE_ROLE_KEY to environment variables.'
      });
    }

    // Create service client
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    );

    // Fetch payment sessions (only select columns that exist)
    const { data: paymentSessions, error } = await supabase
      .from('payment_sessions')
      .select(`
        id,
        order_id,
        customer_email,
        customer_phone,
        amount,
        currency,
        session_status,
        test_case_id,
        test_scenario,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching payment sessions:', error);
      
      // If table doesn't exist, return empty array
      if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          data: [],
          message: 'Payment sessions table not yet created. Run migration first.'
        });
      }
      
      return NextResponse.json({
        success: true,
        data: [],
        error: error.message
      });
    }

    return NextResponse.json({
      success: true,
      data: paymentSessions || []
    });

  } catch (error) {
    console.error('Payment sessions API error:', error);
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Error fetching payment sessions. Please check configuration.'
    });
  }
} 