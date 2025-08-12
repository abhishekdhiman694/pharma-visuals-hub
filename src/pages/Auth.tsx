import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [method, setMethod] = useState<'password' | 'otp'>('password');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP state
  const [otpStage, setOtpStage] = useState<'enter' | 'verify'>('enter');
  const [otp, setOtp] = useState('');

  useEffect(() => {
    document.title = (mode === 'signin' ? 'Sign in' : 'Sign up') + ' - MedVis';
  }, [mode]);

  // Redirect if already authenticated
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        toast('Signed in');
        window.location.href = '/';
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.href = '/';
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const onSignInPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return toast('Sign in failed', { description: error.message });
    toast('Signed in');
  };

  const onSignUpPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl }
    });
    if (error) return toast('Sign up failed', { description: error.message });
    toast('Check your email to confirm sign up');
  };

  // OTP: send code (works for both sign-in and sign-up)
  const onSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return toast('Enter your email');
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectUrl,
        shouldCreateUser: mode === 'signup',
      },
    });
    if (error) return toast('Failed to send code', { description: error.message });
    toast('Verification code sent to your email');
    setOtp('');
    setOtpStage('verify');
  };

  const onVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return toast('Enter the 6-digit code');
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });
    if (error) return toast('Invalid or expired code', { description: error.message });
    toast('Verified');
    // onAuthStateChange will redirect
  };

  const headerTitle = mode === 'signin' ? 'Sign in' : 'Create an account';
  const subText = method === 'password' ? 'Use email and password' : 'Use one-time code sent to your email';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <main className="container px-6 py-10">
        <Card className="max-w-md mx-auto p-6 space-y-6">
          <header>
            <h1 className="text-2xl font-semibold">{headerTitle}</h1>
            <p className="text-sm text-muted-foreground">{subText}</p>
          </header>

          {/* Method toggle */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={method === 'password' ? 'hero' : 'outline'}
              onClick={() => { setMethod('password'); setOtpStage('enter'); }}
            >
              Password
            </Button>
            <Button
              variant={method === 'otp' ? 'hero' : 'outline'}
              onClick={() => setMethod('otp')}
            >
              Email OTP
            </Button>
          </div>

          {method === 'password' ? (
            <form onSubmit={mode === 'signin' ? onSignInPassword : onSignUpPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" variant="hero" className="w-full">{mode === 'signin' ? 'Sign in' : 'Sign up'}</Button>
            </form>
          ) : (
            <div className="space-y-4">
              {otpStage === 'enter' ? (
                <form onSubmit={onSendOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <Button type="submit" variant="hero" className="w-full">Send code</Button>
                </form>
              ) : (
                <form onSubmit={onVerifyOtp} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Enter 6-digit code</Label>
                    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        {[0,1,2,3,4,5].map((i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="hero" className="flex-1">Verify</Button>
                    <Button type="button" variant="outline" className="flex-1" onClick={(e) => onSendOtp(e)}>Resend</Button>
                  </div>
                  <Button type="button" variant="outline" onClick={() => setOtpStage('enter')}>Change email</Button>
                </form>
              )}
            </div>
          )}

          <div className="text-center text-sm">
            {mode === 'signin' ? (
              <button className="underline" onClick={() => { setMode('signup'); setMethod('password'); setOtpStage('enter'); }}>Need an account? Sign up</button>
            ) : (
              <button className="underline" onClick={() => { setMode('signin'); setMethod('password'); setOtpStage('enter'); }}>Already have an account? Sign in</button>
            )}
          </div>

          <div className="text-center">
            <a href="/" className="text-sm text-muted-foreground underline">Back to Home</a>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
