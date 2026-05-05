import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User, Loader2, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!" });
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: "Account created!", description: "You can now use all features." });
        navigate("/dashboard");
      }
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-ocean-subtle" />
      <Card className="glass rounded-2xl p-8 w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Droplets className="h-8 w-8 text-primary" />
            <span className="font-heading text-2xl font-bold text-gradient-ocean">DataFlow</span>
          </div>
          <h1 className="font-heading text-2xl font-bold mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p className="text-sm text-muted-foreground">{isLogin ? "Sign in to access your predictions" : "Join to save predictions & export reports"}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Label className="flex items-center gap-2 mb-2 text-sm"><User className="h-4 w-4 text-primary" /> Full Name</Label>
              <Input placeholder="Your name" value={fullName} onChange={e => setFullName(e.target.value)} className="bg-background" required />
            </div>
          )}
          <div>
            <Label className="flex items-center gap-2 mb-2 text-sm"><Mail className="h-4 w-4 text-primary" /> Email</Label>
            <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="bg-background" required />
          </div>
          <div>
            <Label className="flex items-center gap-2 mb-2 text-sm"><Lock className="h-4 w-4 text-primary" /> Password</Label>
            <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="bg-background" required minLength={6} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-ocean text-primary-foreground shadow-ocean rounded-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isLogin ? "Sign In" : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </Card>
    </div>
  );
};

export default Auth;
