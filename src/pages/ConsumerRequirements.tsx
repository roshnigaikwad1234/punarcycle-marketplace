import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, MapPin, Scale, Package, FileText } from "lucide-react";
import { toast } from "sonner";

export interface ConsumerRequirement {
  id: string;
  materialType: string;
  quantity: number;
  location: string;
  createdBy: string;
  createdAt: unknown;
}

const MATERIAL_TYPE_OPTIONS = [
  "Plastic scrap",
  "Steel slag",
  "Aluminum scrap",
  "Copper scrap",
  "Cotton waste",
  "Textile offcuts",
  "Paper & cardboard",
  "Wood chips / sawdust",
  "Glass cullet",
  "Rubber scrap",
  "Chemical effluents (treated)",
  "Organic waste",
  "E-waste (processed)",
  "Battery scrap",
  "Oil & grease waste",
  "Metal shavings",
  "Ceramic waste",
  "Other",
];

const ConsumerRequirements = () => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<ConsumerRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [materialType, setMaterialType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequirements = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "consumerRequirements"), where("createdBy", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ConsumerRequirement[];
      const sortKey = (x: ConsumerRequirement) => (x.createdAt as { seconds?: number })?.seconds ?? 0;
      setRequirements(data.sort((a, b) => sortKey(b) - sortKey(a)));
    } catch (error) {
      console.error("Error fetching requirements:", error);
      toast.error("Failed to load requirements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!materialType?.trim()) {
      toast.error("Please select a material type");
      return;
    }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "consumerRequirements"), {
        materialType: materialType.trim(),
        quantity: qty,
        location: location.trim(),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      toast.success("Requirement added. Check AI Matches for suppliers.");
      setMaterialType("");
      setQuantity("");
      setLocation("");
      setShowForm(false);
      fetchRequirements();
    } catch (error) {
      console.error("Error adding requirement:", error);
      toast.error("Failed to add requirement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "consumerRequirements", id));
      setRequirements((prev) => prev.filter((r) => r.id !== id));
      toast.success("Requirement removed");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Consumer Requirements</h1>
          <p className="text-slate-500 mt-1">Enter what raw material you need, in what quantity, and from which location</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20 font-semibold"
        >
          {showForm ? "Cancel" : <><Plus className="h-5 w-5" /> Add Requirement</>}
        </Button>
      </div>

      {showForm && (
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="h-5 w-5" /> New consumer requirement
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Raw material type</Label>
                <Select value={materialType || undefined} onValueChange={setMaterialType}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select material type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Quantity (kg)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 500"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min={1}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Preferred location (city/region)</Label>
                <Input
                  placeholder="e.g. Mumbai, Pune, Bangalore"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={isSubmitting} className="h-12 rounded-xl font-semibold">
                  {isSubmitting ? "Saving..." : "Save requirement"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-48 rounded-3xl bg-slate-50 animate-pulse border border-slate-100" />
          ))
        ) : requirements.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
            <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-7 w-7 text-primary/50" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No requirements yet</h3>
            <p className="text-slate-400 max-w-sm mx-auto mt-2">Add what you need to consume; AI Matches will show producers and consumers.</p>
            <Button className="mt-6" onClick={() => setShowForm(true)}>Add first requirement</Button>
          </div>
        ) : (
          requirements.map((req) => (
            <Card key={req.id} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                    <Package className="h-5 w-5" />
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDelete(req.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <h3 className="text-lg font-bold text-slate-800 capitalize truncate">{req.materialType}</h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-2">
                  <Scale className="h-4 w-4" /> {req.quantity} kg
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                  <MapPin className="h-4 w-4" /> {req.location}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsumerRequirements;
