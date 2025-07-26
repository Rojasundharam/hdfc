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

    // Fetch security audit logs (only select columns that exist)
    const { data: securityLogs, error } = await supabase
      .from('security_audit_log')
      .select(`
        id,
        event_type,
        severity,
        event_description,
        order_id,
        detected_at
      `)
      .order('detected_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('Error fetching security audit logs:', error);
      
      // If table doesn't exist, return empty array
      if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          data: [],
          message: 'Security audit log table not yet created. Run migration first.'
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
      data: securityLogs || []
    });

  } catch (error) {
    console.error('Security audit logs API error:', error);
    return NextResponse.json({
      success: true,
      data: [],
      message: 'Error fetching security audit logs. Please check configuration.'
    });
  }
} 