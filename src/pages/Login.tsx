import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Loader2, DollarSign } from "lucide-react";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      if (isSignup) {
        if (!username) {
          toast.error("Username is required");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Account created! Logging you in…");
          navigate("/");
        } else {
          toast.success("Signup successful! You can now log in.");
          setIsSignup(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-10 h-10 bg-foreground rounded-lg flex items-center justify-center mb-4">
            <DollarSign className="w-5 h-5 text-background" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
            MoneyMade
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSignup ? "Create your account" : "Sign in to your account"}
          </p>
        </div>

        <form id="auth-form" onSubmit={handleSubmit} className="space-y-3">
          {isSignup && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Username
              </label>
              <input
                id="username-input"
                type="text"
                placeholder="yourname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2.5 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
            <input
              id="email-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Password</label>
            <input
              id="password-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
            />
          </div>

          <button
            id="submit-btn"
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-md text-sm font-medium hover:opacity-80 disabled:opacity-50 transition-opacity mt-1"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSignup ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            id="toggle-auth-mode"
            onClick={() => setIsSignup(!isSignup)}
            className="text-foreground font-medium underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            {isSignup ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
