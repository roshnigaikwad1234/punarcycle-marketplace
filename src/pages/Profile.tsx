import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const INDUSTRIES = ["Steel", "Textile", "Pharma", "Food Processing", "Chemical", "Automotive", "Electronics", "Construction", "Paper & Pulp", "Other"];

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    name: profile?.name || "",
    industryType: profile?.industryType || "",
    location: profile?.location || "",
    produces: profile?.produces || "",
    complianceDetails: profile?.complianceDetails || "",
    role: profile?.role || "both",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, "factories", user.uid), form);
    await refreshProfile();
    toast({ title: "Profile updated!" });
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-primary" /> Factory Profile
        </h1>
        <p className="text-muted-foreground">Manage your factory details and compliance info.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {profile?.name}
            <Badge variant="outline" className="capitalize">{profile?.role?.replace("both", "Generator & Consumer")}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Factory Name</Label>
            <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Industry Type</Label>
            <Select value={form.industryType} onValueChange={(v) => setForm((p) => ({ ...p, industryType: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>What does your factory produce?</Label>
            <Input value={form.produces} onChange={(e) => setForm((p) => ({ ...p, produces: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v as "generator" | "consumer" | "both" }))}>
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
            <Textarea value={form.complianceDetails} onChange={(e) => setForm((p) => ({ ...p, complianceDetails: e.target.value }))} />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
