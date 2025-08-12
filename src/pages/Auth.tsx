import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    document.title = mode === 'signin' ? 'Sign in - MedVis' : 'Sign up - MedVis';
  }, [mode]);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return toast('Sign in failed', { description: error.message });
    toast('Signed in');
    window.location.href = '/admin';
  };

  const onSignUp = async (e: React.FormEvent) => {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <main className="container px-6 py-10">
        <Card className="max-w-md mx-auto p-6 space-y-6">
          <header>
            <h1 className="text-2xl font-semibold">{mode === 'signin' ? 'Sign in' : 'Create an account'}</h1>
            <p className="text-sm text-muted-foreground">Use email and password</p>
          </header>

          <form onSubmit={mode === 'signin' ? onSignIn : onSignUp} className="space-y-4">
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

          <div className="text-center text-sm">
            {mode === 'signin' ? (
              <button className="underline" onClick={() => setMode('signup')}>Need an account? Sign up</button>
            ) : (
              <button className="underline" onClick={() => setMode('signin')}>Already have an account? Sign in</button>
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
