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

    // Fetch transaction details (only select columns that exist)
    const { data: transactions, error } = await supabase
      .from('transaction_details')
      .select(`
        id,
        order_id,
        transaction_id,
        status,
        signature_verified,
        hdfc_response_raw,
        form_data_received,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching transaction details:', error);
      
      // If table doesn't exist, return empty array
      if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          data: [],
          message: 'Transaction details table not yet created. Run migration first.'
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
      data: transactions || []
    });

  } catch (error) {
    console.error('Transaction details API error:', error);
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Error fetching transaction details. Please check configuration.'
    });
  }
} 