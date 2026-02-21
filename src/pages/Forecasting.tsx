import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Calendar, Package, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

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

const TIMEFRAME_OPTIONS = [
  { value: "6", label: "6 months" },
  { value: "8", label: "8 months" },
];

export interface Forecast {
  id: string;
  materialType: string;
  quantity: number;
  timeframeMonths: number;
  location: string;
  createdBy: string;
  createdAt: unknown;
}

const Forecasting = () => {
  const { user } = useAuth();
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [materialType, setMaterialType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [timeframeMonths, setTimeframeMonths] = useState("6");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchForecasts = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "forecasts"), where("createdBy", "==", user.uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Forecast[];
      const sortKey = (x: Forecast) => (x.createdAt as { seconds?: number })?.seconds ?? 0;
      setForecasts(data.sort((a, b) => sortKey(b) - sortKey(a)));
    } catch (error) {
      console.error("Error fetching forecasts:", error);
      toast.error("Failed to load forecasts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
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
      await addDoc(collection(db, "forecasts"), {
        materialType: materialType.trim(),
        quantity: qty,
        timeframeMonths: parseInt(timeframeMonths, 10),
        location: location.trim() || "—",
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      toast.success("Forecast added. Use it to arrange pre-deals with partners.");
      setMaterialType("");
      setQuantity("");
      setTimeframeMonths("6");
      setLocation("");
      setShowForm(false);
      fetchForecasts();
    } catch (error) {
      console.error("Error adding forecast:", error);
      toast.error("Failed to add forecast");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "forecasts", id));
      setForecasts((prev) => prev.filter((f) => f.id !== id));
      toast.success("Forecast removed");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Forecasting</h1>
          <p className="text-slate-500 mt-1">Tell partners how much waste you expect in 6 or 8 months and arrange pre-deals</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 rounded-xl font-semibold"
        >
          {showForm ? "Cancel" : <><Plus className="h-5 w-5" /> Add forecast</>}
        </Button>
      </div>

      {showForm && (
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Expected waste (future)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Material type</Label>
                <Select value={materialType || undefined} onValueChange={setMaterialType}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Expected quantity (kg)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 2000"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  min={1}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">In how many months?</Label>
                <Select value={timeframeMonths} onValueChange={setTimeframeMonths}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEFRAME_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Location (city)</Label>
                <Input
                  placeholder="e.g. Mumbai, Pune"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" disabled={isSubmitting} className="h-12 rounded-xl font-semibold">
                  {isSubmitting ? "Saving..." : "Save forecast"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Your forecasts</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-50 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : forecasts.length === 0 ? (
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-12 text-center rounded-[2rem]">
            <div className="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-7 w-7 text-primary/50" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No forecasts yet</h3>
            <p className="text-slate-400 max-w-sm mx-auto mt-2">Add expected waste (e.g. in 6 or 8 months) to arrange pre-deals with buyers or suppliers.</p>
            <Button className="mt-6" onClick={() => setShowForm(true)}>Add first forecast</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forecasts.map((f) => (
              <Card key={f.id} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center">
                      <Package className="h-5 w-5" />
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDelete(f.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 capitalize">{f.materialType}</h3>
                  <p className="text-sm text-slate-500 mt-1">{f.quantity.toLocaleString()} kg in {f.timeframeMonths} months</p>
                  {f.location && f.location !== "—" && <p className="text-xs text-slate-400 mt-1">{f.location}</p>}
                  <Link to="/dashboard/matches" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                    Create pre-deal for this forecast <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Forecasting;
