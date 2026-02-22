import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import logo from "@/assets/logo.png";
import heroVideo from "@/assets/v1.mp4";
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
      setError(
        err.message?.includes("invalid")
          ? "Invalid email or password"
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
      {/* ===== Background Video ===== */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* ===== Content ===== */}
      <div className="relative z-10 flex w-full max-w-5xl items-center justify-center lg:justify-between">
        {/* Left Branding Section (Desktop Only) */}
        <div className="hidden lg:flex flex-col justify-center items-center text-center w-1/2 px-10">
          <img src={logo} alt="punarCYCLE" className="w-72 mb-8" />
          <h1 className="text-3xl font-bold text-white mb-4">
            Reuse · Trade · Sustain
          </h1>
          <p className="text-white/80 max-w-md text-lg">
            AI-powered B2B circular economy marketplace converting industrial
            waste into valuable raw materials.
          </p>
        </div>

        {/* Login Card */}
        <div className="flex w-full lg:w-1/2 justify-center">
          <Card className="w-full max-w-md bg-card/90 backdrop-blur-md shadow-2xl border-border/50">
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center lg:hidden mb-4">
                <img src={logo} alt="punarCYCLE" className="w-24" />
              </div>
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-muted-foreground">
                Sign in to your factory account
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="factory@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    className="text-primary font-semibold hover:underline"
                  >
                    Register your factory
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;