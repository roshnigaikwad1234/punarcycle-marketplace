import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import heroVideo from "@/assets/v1.mp4";
import logo from "@/assets/logo.png";

const INDUSTRIES = ["Steel", "Textile", "Pharma", "Electronics"];

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    industryType: "",
    location: "",
    email: "",
    password: "",
    licenseFile: null as File | null,
    contactFile: null as File | null,
    role: "" as "generator" | "consumer" | "both" | "",
  });

  const update = (key: string, val: any) =>
    setForm((p) => ({ ...p, [key]: val }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      await setDoc(doc(db, "factories", cred.user.uid), {
        name: form.name,
        industryType: form.industryType,
        location: form.location,
        role: form.role,
        verificationStatus: "pending",
        licenseUploaded: !!form.licenseFile,
        contactDetailsUploaded: !!form.contactFile,
        createdAt: new Date(),
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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden p-4">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/55" />

      <Card className="relative z-10 w-full max-w-lg bg-card/90 backdrop-blur-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <img src={logo} alt="punarCYCLE" className="w-60 mx-auto" />
          <h2 className="text-2xl font-bold">Register Your Factory</h2>
          <p className="text-sm text-muted-foreground">Step {step} of 4</p>

          <div className="flex justify-center gap-2 pt-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-14 rounded-full ${
                  step >= s ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive rounded-md">
                {error}
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <>
                <Label>Factory Name</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />

                <Label>Industry Type</Label>
                <Select onValueChange={(v) => update("industryType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((i) => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Location (City)</Label>
                <Input value={form.location} onChange={(e) => update("location", e.target.value)} required />

                <Button type="button" className="w-full" onClick={() => setStep(2)}>
                  Next
                </Button>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />

                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required />

                <div className="flex gap-3">
                  <Button variant="outline" type="button" onClick={() => setStep(1)}>Back</Button>
                  <Button type="button" onClick={() => setStep(3)}>Next</Button>
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <Label>Company License / Certification</Label>
                <Input type="file" onChange={(e) => update("licenseFile", e.target.files?.[0] || null)} />
                {form.licenseFile && <p className="text-xs text-yellow-600">⏳ Verification pending</p>}

                <Label>Company Contact Details</Label>
                <Input type="file" onChange={(e) => update("contactFile", e.target.files?.[0] || null)} />
                {form.contactFile && <p className="text-xs text-yellow-600">⏳ Verification pending</p>}

                <div className="flex gap-3">
                  <Button variant="outline" type="button" onClick={() => setStep(2)}>Back</Button>
                  <Button type="button" onClick={() => setStep(4)}>Next</Button>
                </div>
              </>
            )}

            {/* STEP 4 – ROLE */}
            {step === 4 && (
              <>
                <Label className="text-base font-semibold">
                  How will your company use punarCYCLE?
                </Label>

                <Select onValueChange={(v) => update("role", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="generator">♻️ Waste Generator</SelectItem>
                    <SelectItem value="consumer">🏭 Waste Consumer</SelectItem>
                    <SelectItem value="both">🔁 Generator & Consumer</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-3">
                  <Button variant="outline" type="button" onClick={() => setStep(3)}>
                    Back
                  </Button>
                  <Button type="submit" disabled={loading || !form.role}>
                    {loading ? "Submitting..." : "Complete Registration"}
                  </Button>
                </div>
              </>
            )}

            <div className="text-center text-sm pt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;