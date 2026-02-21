import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, updateDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Edit, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { WasteListing } from "@/lib/matching";

const WASTE_TYPES = ["Plastic Scrap", "Fly Ash", "Metal Scrap", "Chemical Waste", "Textile Waste", "Organic Waste", "Glass Waste", "Rubber Waste", "Wood Waste", "E-Waste"];
const FREQUENCIES = ["Daily", "Weekly", "Monthly", "One-time"];

const emptyForm = {
  wasteType: "", quantity: "", unit: "kg", frequency: "Monthly",
  location: "", latitude: "28.6139", longitude: "77.2090",
  hazardous: false, availabilityStart: "", availabilityEnd: "",
};

const WasteListings = () => {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState<WasteListing[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!user) return;
    const snap = await getDocs(query(collection(db, "wasteListings"), where("factoryId", "==", user.uid)));
    setListings(snap.docs.map((d) => ({ id: d.id, ...d.data() } as WasteListing)));
  };

  useEffect(() => { load(); }, [user]);

  const handleSubmit = async () => {
    if (!user || !form.wasteType || !form.quantity) return;
    setLoading(true);
    const data = {
      factoryId: user.uid,
      factoryName: profile?.name || "",
      wasteType: form.wasteType.toLowerCase(),
      quantity: parseFloat(form.quantity),
      unit: form.unit,
      frequency: form.frequency,
      location: form.location || profile?.location || "",
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      hazardous: form.hazardous,
      availabilityStart: form.availabilityStart,
      availabilityEnd: form.availabilityEnd,
      createdAt: serverTimestamp(),
    };
    if (editId) {
      await updateDoc(doc(db, "wasteListings", editId), data);
    } else {
      await addDoc(collection(db, "wasteListings"), data);
    }
    setForm(emptyForm);
    setEditId(null);
    setOpen(false);
    setLoading(false);
    load();
  };

  const handleEdit = (l: WasteListing) => {
    setForm({
      wasteType: l.wasteType, quantity: String(l.quantity), unit: l.unit,
      frequency: l.frequency, location: l.location,
      latitude: String(l.latitude), longitude: String(l.longitude),
      hazardous: l.hazardous, availabilityStart: l.availabilityStart, availabilityEnd: l.availabilityEnd,
    });
    setEditId(l.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "wasteListings", id));
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Waste Listings</h1>
          <p className="text-muted-foreground">Manage your industrial waste inventory</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setForm(emptyForm); setEditId(null); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> New Listing</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editId ? "Edit" : "Create"} Waste Listing</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Waste Type</Label>
                <Select value={form.wasteType} onValueChange={(v) => setForm((p) => ({ ...p, wasteType: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>{WASTE_TYPES.map((t) => <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} placeholder="500" />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={form.unit} onValueChange={(v) => setForm((p) => ({ ...p, unit: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="tons">Tons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm((p) => ({ ...p, frequency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} placeholder="City" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Available From</Label>
                  <Input type="date" value={form.availabilityStart} onChange={(e) => setForm((p) => ({ ...p, availabilityStart: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Available Until</Label>
                  <Input type="date" value={form.availabilityEnd} onChange={(e) => setForm((p) => ({ ...p, availabilityEnd: e.target.value }))} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.hazardous} onCheckedChange={(v) => setForm((p) => ({ ...p, hazardous: v }))} />
                <Label>Hazardous Material</Label>
              </div>
              <Button onClick={handleSubmit} className="w-full" disabled={loading}>
                {loading ? "Saving..." : editId ? "Update Listing" : "Create Listing"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No waste listings yet. Create your first one!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => (
            <Card key={l.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base capitalize">{l.wasteType}</CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(l)}><Edit className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(l.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-2">
                  <Badge variant={l.hazardous ? "destructive" : "secondary"}>
                    {l.hazardous ? "Hazardous" : "Non-Hazardous"}
                  </Badge>
                  <Badge variant="outline">{l.frequency}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {l.quantity} {l.unit} · {l.location}
                </p>
                {l.availabilityStart && (
                  <p className="text-xs text-muted-foreground">
                    {l.availabilityStart} → {l.availabilityEnd}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WasteListings;
