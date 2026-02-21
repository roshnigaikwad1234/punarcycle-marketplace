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
import { Textarea } from "@/components/ui/textarea";
import logo from "@/assets/logo.png";

const INDUSTRIES = ["Steel", "Textile", "Pharma", "Food Processing", "Chemical", "Automotive", "Electronics", "Construction", "Paper & Pulp", "Other"];

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "", password: "", confirmPassword: "",
    name: "", industryType: "", location: "", latitude: "28.6139", longitude: "77.2090",
    produces: "", complianceDetails: "", role: "both" as "generator" | "consumer" | "both",
  });

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Passwords don't match"); return; }
    setError(""); setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "factories", cred.user.uid), {
        name: form.name, industryType: form.industryType, location: form.location,
        latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude),
        produces: form.produces, complianceDetails: form.complianceDetails, role: form.role,
      });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message?.includes("already") ? "Email already registered" : "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero p-4">
      <Card className="w-full max-w-lg border-border/50">
        <CardHeader className="text-center space-y-2">
          <img src={logo} alt="punarCYCLE" className="w-20 mx-auto" />
          <h2 className="text-2xl font-display font-bold">Register Your Factory</h2>
          <p className="text-muted-foreground">Step {step} of 2</p>
          <div className="flex gap-2 justify-center">
            <div className={`h-1 w-16 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
            <div className={`h-1 w-16 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Factory Name</Label>
                  <Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Acme Industries" required />
                </div>
                <div className="space-y-2">
                  <Label>Industry Type</Label>
                  <Select value={form.industryType} onValueChange={(v) => update("industryType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location (City)</Label>
                  <Input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Mumbai" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Input value={form.latitude} onChange={(e) => update("latitude", e.target.value)} type="number" step="any" />
                  </div>
                  <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Input value={form.longitude} onChange={(e) => update("longitude", e.target.value)} type="number" step="any" />
                  </div>
                </div>
                <Button type="button" className="w-full" onClick={() => { if (form.name && form.industryType && form.location) setStep(2); }}>
                  Next Step
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={6} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm</Label>
                    <Input type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>What does your factory produce?</Label>
                  <Input value={form.produces} onChange={(e) => update("produces", e.target.value)} placeholder="Steel coils, auto parts..." />
                </div>
                <div className="space-y-2">
                  <Label>Your Role</Label>
                  <Select value={form.role} onValueChange={(v) => update("role", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="generator">Waste Generator</SelectItem>
                      <SelectItem value="consumer">Waste Consumer</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Compliance / Certifications</Label>
                  <Textarea value={form.complianceDetails} onChange={(e) => update("complianceDetails", e.target.value)} placeholder="ISO 14001, PCB license..." />
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                  <Button type="submit" className="flex-1" disabled={loading}>{loading ? "Creating..." : "Register"}</Button>
                </div>
              </>
            )}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
