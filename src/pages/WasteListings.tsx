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
import { Plus, Trash2, Edit, Package, MapPin, Scale, AlertTriangle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import type { WasteListing } from "@/lib/matching";
import { generateMatchesForWaste } from "@/lib/matching";

const WASTE_TYPES = ["Plastic Scrap", "Fly Ash", "Metal Scrap", "Chemical Waste", "Textile Waste", "Organic Waste", "Glass Waste", "Rubber Waste", "Wood Waste", "E-Waste"];

const emptyForm = {
  wasteType: "",
  quantity: "",
  city: "",
  hazardous: false,
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
    const snap = await getDocs(query(collection(db, "wasteListings"), where("createdBy", "==", user.uid)));
    const realListings = snap.docs.map((d) => ({ id: d.id, ...d.data() } as WasteListing));
    setListings(realListings);
  };

  useEffect(() => { load(); }, [user]);

  const handleSubmit = async () => {
    if (!user || !form.wasteType || !form.quantity) return;
    setLoading(true);
    try {
      const data = {
        wasteType: form.wasteType.toLowerCase(),
        quantity: parseFloat(form.quantity),
        city: form.city || profile?.location || "",
        hazardous: form.hazardous,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      };

      let listingId: string;
      if (editId) {
        await updateDoc(doc(db, "wasteListings", editId), data);
        listingId = editId;
        toast({ title: "Inventory updated", description: "Material specifications successfully synchronized." });
      } else {
        const docRef = await addDoc(collection(db, "wasteListings"), data);
        listingId = docRef.id;

        try {
          await generateMatchesForWaste(listingId);
          toast({ title: "Asset published", description: "Listing live & AI matching engine cycle complete." });
        } catch (matchError) {
          console.error("Error generating matches:", matchError);
          toast({ title: "Asset published", description: "Listing saved. Background analysis pending." });
        }
      }

      setForm(emptyForm);
      setEditId(null);
      setOpen(false);
      load();
    } catch (error) {
      console.error("Error saving listing:", error);
      toast({ title: "Error", description: "Failed to sync inventory. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (l: WasteListing) => {
    setForm({
      wasteType: l.wasteType,
      quantity: String(l.quantity),
      city: l.city || "",
      hazardous: !!l.hazardous,
    });
    setEditId(l.id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "wasteListings", id));
      load();
      toast({ title: "Asset removed", description: "Listing successfully purged from inventory." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove asset." });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Material Inventory</h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest">Global Resource Management</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setForm(emptyForm); setEditId(null); } }}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-12 px-6 shadow-xl shadow-primary/20"><Plus className="h-4.5 w-4.5 mr-2" /> Publish Asset</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-[2.5rem] p-10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-900">{editId ? "Material Modification" : "Publish New Resource"}</DialogTitle>
              <p className="text-slate-400 text-sm font-medium">Specify industrial material parameters for AI discovery.</p>
            </DialogHeader>
            <div className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Material Category</Label>
                <Select value={form.wasteType} onValueChange={(v) => setForm((p) => ({ ...p, wasteType: v }))}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent className="rounded-2xl">{WASTE_TYPES.map((t) => <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quantity (kg)</Label>
                  <Input type="number" className="h-12 rounded-xl border-slate-200 bg-slate-50/50" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Origin City</Label>
                  <Input className="h-12 rounded-xl border-slate-200 bg-slate-50/50" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} placeholder="e.g. Pune" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${form.hazardous ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                    {form.hazardous ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Safety Protocol</p>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{form.hazardous ? "Hazardous Handling" : "Standard Resource"}</p>
                  </div>
                </div>
                <Switch checked={form.hazardous} onCheckedChange={(v) => setForm((p) => ({ ...p, hazardous: v }))} />
              </div>
              <Button onClick={handleSubmit} className="w-full h-14 text-lg font-bold rounded-2xl shadow-2xl shadow-primary/20" disabled={loading}>
                {loading ? "Processing..." : editId ? "Execute Update" : "Confirm Publication"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/40">
          <div className="h-24 w-24 rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center mb-10">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Inventory Empty</h3>
          <p className="text-slate-500 max-w-sm text-center font-medium leading-relaxed mb-10">
            Your circular resource cycle hasn't started yet. Initialize your first asset discovery below.
          </p>
          <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 bg-white" onClick={() => setOpen(true)}>
            <Plus className="h-4.5 w-4.5 mr-2" /> Create First Listing
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((l) => (
            <Card key={l.id} className="overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-500 bg-white rounded-[2.5rem] group border border-slate-100">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="h-14 w-14 bg-slate-50 group-hover:bg-primary/5 rounded-[1.25rem] flex items-center justify-center transition-colors">
                    <Package className="h-7 w-7 text-primary/60 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-900" onClick={() => handleEdit(l)}><Edit className="h-4.5 w-4.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-destructive/10 text-slate-400 hover:text-destructive" onClick={() => handleDelete(l.id)}><Trash2 className="h-4.5 w-4.5" /></Button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 capitalize tracking-tight leading-none mb-3">{l.wasteType}</h3>

                <div className="flex flex-wrap gap-2 mb-8">
                  <Badge className={`${l.hazardous ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-100'} border-none px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest`}>
                    {l.hazardous ? "High Precision Required" : "Standard Handling"}
                  </Badge>
                  {l.hazardous && <Badge variant="destructive" className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none">Hazardous</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Scale className="h-3 w-3" /> Available</p>
                    <p className="font-bold text-slate-800 tracking-tight">{l.quantity.toLocaleString()} kg</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Location</p>
                    <p className="font-bold text-slate-800 tracking-tight">{l.city || "Mumbai"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WasteListings;
