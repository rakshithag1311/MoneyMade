import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

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
            data: {
              username: username,
            },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        
        if (data.session) {
          toast.success("Account created! Logging you in...");
          navigate("/");
        } else {
          toast.success("Signup successful! You can now log in.");
          setIsSignup(false);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
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
        <div className="text-center mb-10">
          <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">
            Money Made
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {isSignup ? "Create your account" : "Welcome back"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <Input
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
          <Button type="submit" className="w-full">
            {isSignup ? "Sign Up" : "Log In"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-foreground font-medium underline underline-offset-4 hover:text-primary"
          >
            {isSignup ? "Log In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
