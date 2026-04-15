import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setUser } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (isSignup) {
      if (!username) return;
      localStorage.setItem("user_" + email, JSON.stringify({ username, password }));
      setUser(email, username);
    } else {
      const stored = localStorage.getItem("user_" + email);
      if (!stored) {
        alert("No account found. Please sign up.");
        return;
      }
      const userData = JSON.parse(stored);
      if (userData.password !== password) {
        alert("Incorrect password.");
        return;
      }
      setUser(email, userData.username);
    }
    navigate("/");
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
