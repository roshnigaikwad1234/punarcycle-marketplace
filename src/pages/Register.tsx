import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import logo from "@/assets/logo.png";

const INDUSTRIES = ["Steel", "Textile", "Pharma", "Electronics"];

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    industryType: "",
    location: "",
    produces: "",
    role: "both" as "generator" | "consumer" | "both",
    certificateFile: null as File | null,
  });

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "factories", cred.user.uid), {
        name: form.name,
        industryType: form.industryType,
        location: form.location,
        produces: form.produces,
        role: form.role,
        certificateVerified: !!form.certificateFile,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(
        err.message?.includes("already")
          ? "Email already registered"
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero p-4">
      <Card className="w-full max-w-lg border-border/50 shadow-xl bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 pb-2">
          <img
            src={logo}
            alt="punarCYCLE"
            style={{ width: '280px', height: 'auto', display: 'block', margin: '0 auto' }}
          />
          <div className="space-y-1">
            <h2 className="text-2xl font-display font-bold">Register Your Factory</h2>
            <p className="text-muted-foreground text-sm font-medium">Step {step} of 2</p>
          </div>
          <div className="flex gap-2 justify-center pt-2">
            <div className={`h-1.5 w-20 rounded-full transition-all duration-300 ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-1.5 w-20 rounded-full transition-all duration-300 ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 animate-fade-in">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="factoryName">Factory Name</Label>
                  <Input
                    id="factoryName"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industryType">Industry Type</Label>
                  <Select value={form.industryType} onValueChange={(v) => update("industryType", v)}>
                    <SelectTrigger id="industryType" className="h-11">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((i) => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location (City)</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => update("location", e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cert">Upload legal Certification</Label>
                  <div className="flex flex-col gap-2">
                    <Input
                      id="cert"
                      type="file"
                      accept="application/pdf,image/*"
                      onChange={(e) => setForm(p => ({ ...p, certificateFile: e.target.files?.[0] || null }))}
                      className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all h-11"
                    />
                    {form.certificateFile && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 rounded-md border border-green-500/20">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-semibold text-green-700">File attached: {form.certificateFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full h-11 text-base font-semibold transition-all hover:translate-y-[-1px]"
                  onClick={() => {
                    if (form.name && form.industryType && form.location) setStep(2);
                  }}
                >
                  Next Step
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    required
                    minLength={6}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="waste">What waste does your factory produce?</Label>
                  <Input
                    id="waste"
                    value={form.produces}
                    onChange={(e) => update("produces", e.target.value)}
                    placeholder="e.g. Scrap metal, chemical effluents..."
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Your Primary Role</Label>
                  <Select value={form.role} onValueChange={(v) => update("role", v)}>
                    <SelectTrigger id="role" className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generator">Waste Generator</SelectItem>
                      <SelectItem value="consumer">Waste Consumer</SelectItem>
                      <SelectItem value="both">Generator & Consumer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 font-semibold"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-11 font-semibold transition-all hover:translate-y-[-1px]"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Register Facility"}
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground pt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-bold hover:underline transition-color">
                Sign in here
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
