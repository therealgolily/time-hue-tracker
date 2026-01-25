import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constant-time string comparison to prevent timing attacks
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do the comparison to maintain constant time
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ (b.charCodeAt(i % b.length) || 0);
    }
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const securityPin = Deno.env.get('SECURITY_PIN');

    if (!securityPin) {
      console.error('SECURITY_PIN secret not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user's JWT using getUser
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;

    // Get or create auth session
    const { data: session, error: sessionError } = await supabase
      .from('auth_sessions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (sessionError) {
      console.error('Session fetch error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Server error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();

    // Check for lockout
    if (session?.lockout_until) {
      const lockoutUntil = new Date(session.lockout_until);
      if (now < lockoutUntil) {
        const remainingMinutes = Math.ceil((lockoutUntil.getTime() - now.getTime()) / 60000);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid credentials',
            locked: true,
            remainingMinutes 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Check partial auth expiry (5 minutes)
    if (session?.auth_level === 'partial' && session?.partial_expires_at) {
      const expiresAt = new Date(session.partial_expires_at);
      if (now > expiresAt) {
        // Reset to none - partial auth expired
        await supabase
          .from('auth_sessions')
          .update({ 
            auth_level: 'none', 
            partial_expires_at: null,
            updated_at: now.toISOString()
          })
          .eq('user_id', userId);

        return new Response(
          JSON.stringify({ error: 'Session expired', expired: true }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Parse request body
    const { pin } = await req.json();

    if (!pin || typeof pin !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify PIN using constant-time comparison
    const isValidPin = timingSafeEqual(pin, securityPin);

    if (!isValidPin) {
      // Increment failed attempts
      const newFailedAttempts = (session?.failed_attempts || 0) + 1;
      const updateData: Record<string, unknown> = {
        failed_attempts: newFailedAttempts,
        updated_at: now.toISOString()
      };

      // Lock out after 5 failed attempts for 15 minutes
      if (newFailedAttempts >= 5) {
        const lockoutUntil = new Date(now.getTime() + 15 * 60 * 1000);
        updateData.lockout_until = lockoutUntil.toISOString();
        updateData.auth_level = 'none';
        updateData.partial_expires_at = null;
      }

      if (session) {
        await supabase
          .from('auth_sessions')
          .update(updateData)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('auth_sessions')
          .insert({ 
            user_id: userId, 
            auth_level: 'none',
            ...updateData 
          });
      }

      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PIN is valid - grant full access
    const updateData = {
      auth_level: 'full',
      partial_expires_at: null,
      failed_attempts: 0,
      lockout_until: null,
      updated_at: now.toISOString()
    };

    if (session) {
      await supabase
        .from('auth_sessions')
        .update(updateData)
        .eq('user_id', userId);
    } else {
      await supabase
        .from('auth_sessions')
        .insert({ user_id: userId, ...updateData });
    }

    return new Response(
      JSON.stringify({ success: true, auth_level: 'full' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verify PIN error:', error);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
