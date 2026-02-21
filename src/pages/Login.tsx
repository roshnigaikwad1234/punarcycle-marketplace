import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import logo from "@/assets/logo.png";
import { Leaf } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message?.includes("invalid") ? "Invalid email or password" : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen gradient-hero">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12">
        <img src={logo} alt="punarCYCLE" className="w-72 mb-8" />
        <h1 className="text-3xl font-display font-bold text-gradient mb-4">
          Reuse · Trade · Sustain
        </h1>
        <p className="text-muted-foreground text-center max-w-md text-lg">
          AI-powered B2B circular economy marketplace. Convert industrial waste into valuable raw materials.
        </p>
      </div>
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <Card className="w-full max-w-md border-border/50">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 lg:hidden mb-4">
              <img src={logo} alt="punarCYCLE" className="w-16" />
            </div>
            <h2 className="text-2xl font-display font-bold">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to your factory account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="factory@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">Register your factory</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
