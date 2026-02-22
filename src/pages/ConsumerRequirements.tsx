import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  MapPin,
  Scale,
  Package,
  FileText,
  IndianRupee,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export interface ConsumerRequirement {
  id: string;
  materialType: string;
  quantity: number;
  pricePerKg: number;
  location: string;
  hazardous: boolean;
  createdBy: string;
  createdAt: any;
}

const MATERIAL_TYPE_OPTIONS = [
  "Plastic scrap",
  "Steel slag",
  "Aluminum scrap",
  "Copper scrap",
  "Textile offcuts",
  "Paper & cardboard",
  "Rubber scrap",
  "Glass cullet",
  "E-waste (processed)",
  "Other",
];

const ConsumerRequirements = () => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<ConsumerRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [materialType, setMaterialType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pricePerKg, setPricePerKg] = useState("");
  const [location, setLocation] = useState("");
  const [hazardous, setHazardous] = useState("non-hazardous");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRequirements = async () => {
    if (!user) return;
    setLoading(true);
    const q = query(
      collection(db, "consumerRequirements"),
      where("createdBy", "==", user.uid)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as ConsumerRequirement[];
    setRequirements(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequirements();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "consumerRequirements"), {
        materialType,
        quantity: Number(quantity),
        pricePerKg: Number(pricePerKg),
        location,
        hazardous: hazardous === "hazardous",
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      toast.success("Requirement added successfully");
      setMaterialType("");
      setQuantity("");
      setPricePerKg("");
      setLocation("");
      setHazardous("non-hazardous");
      setShowForm(false);
      fetchRequirements();
    } catch {
      toast.error("Failed to add requirement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "consumerRequirements", id));
    setRequirements((prev) => prev.filter((r) => r.id !== id));
    toast.success("Requirement removed");
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Consumer Requirements</h1>
          <p className="text-muted-foreground">
            Specify the raw materials you want to consume
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          {showForm ? "Cancel" : "Add Requirement"}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              New Requirement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="grid md:grid-cols-2 gap-6"
            >
              <div>
                <Label>Material Type</Label>
                <Select value={materialType} onValueChange={setMaterialType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIAL_TYPE_OPTIONS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Quantity (kg)</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Price per kg (₹)</Label>
                <Input
                  type="number"
                  value={pricePerKg}
                  onChange={(e) => setPricePerKg(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Hazard Level</Label>
                <Select value={hazardous} onValueChange={setHazardous}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="non-hazardous">
                      Non-hazardous
                    </SelectItem>
                    <SelectItem value="hazardous">Hazardous</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label>Preferred Location</Label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City / Region"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Requirement"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Empty State / Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-xl bg-muted animate-pulse"
              />
            ))
        ) : requirements.length === 0 ? (
          <div className="col-span-full flex justify-center py-24">
            <div className="text-center bg-white border border-dashed rounded-3xl p-12 max-w-xl">
              <div className="h-16 w-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                <Package className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                No active listings
              </h3>
              <p className="text-muted-foreground mb-6">
                Start by posting your first consumer requirement
              </p>
              <Button onClick={() => setShowForm(true)}>
                Post First Asset
              </Button>
            </div>
          </div>
        ) : (
          requirements.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-6 space-y-2">
                <div className="flex justify-between">
                  <h3 className="font-bold">{req.materialType}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(req.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Scale className="h-4 w-4" /> {req.quantity} kg
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee className="h-4 w-4" /> ₹{req.pricePerKg}/kg
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" /> {req.location}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  {req.hazardous ? "Hazardous" : "Non-hazardous"}
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