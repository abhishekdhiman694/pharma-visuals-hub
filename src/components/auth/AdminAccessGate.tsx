import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const AdminAccessGate: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      setIsAuthed(!!session);
      setUserId(session?.user?.id ?? null);
      setLoading(false);

      if (session?.user) {
        checkRole(session.user.id);
      }
    };

    // subscribe first
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session);
      setUserId(session?.user?.id ?? null);
      if (session?.user) {
        checkRole(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    init();
    return () => sub.subscription.unsubscribe();
  }, []);

  const checkRole = async (uid: string) => {
    const { data, error } = await supabase.rpc('has_role', { _user_id: uid, _role: 'admin' });
    if (error) {
      console.error('has_role error', error);
      setIsAdmin(false);
    } else {
      setIsAdmin(!!data);
    }
  };

  const grantAdmin = async () => {
    if (!token.trim()) {
      toast("Please enter the Admin Token");
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke('grant-admin', {
        body: { token }
      });
      if (error) throw error;
      if (data?.success) {
        toast("Admin access granted");
        if (userId) await checkRole(userId);
      } else {
        toast("Failed to grant admin", { description: data?.message || 'Unknown error' });
      }
    } catch (e: any) {
      toast("Grant failed", { description: e?.message || 'Unexpected error' });
    }
  };

  if (loading) {
    return (
      <Card className="max-w-2xl p-6">
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </Card>
    );
  }

  if (!isAuthed) {
    return (
      <Card className="max-w-2xl p-6">
        <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
        <p className="text-sm text-muted-foreground mb-4">Please sign in to access the Admin panel.</p>
        <Button asChild>
          <a href="/auth">Go to Sign in</a>
        </Button>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="max-w-2xl p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Admin access needed</h2>
          <p className="text-sm text-muted-foreground">Enter the Admin Token to grant yourself admin access.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="admintoken">Admin Token</Label>
          <Input id="admintoken" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste token here" />
        </div>
        <div className="flex gap-3">
          <Button onClick={grantAdmin} variant="hero">Grant me admin</Button>
          <Button variant="outline" asChild>
            <a href="/">Back</a>
          </Button>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
};

export default AdminAccessGate;
