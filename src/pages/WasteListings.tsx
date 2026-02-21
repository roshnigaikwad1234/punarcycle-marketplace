import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Package, MapPin, Scale, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { generateMatchesForWaste } from "@/lib/matching";

interface WasteListing {
    id: string;
    wasteType: string;
    quantity: number;
    city: string;
    hazardous: boolean;
    createdAt: any;
}

const WASTE_TYPE_OPTIONS = [
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

const WasteListings = () => {
    const { user } = useAuth();
    const [listings, setListings] = useState<WasteListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form State
    const [wasteType, setWasteType] = useState("");
    const [quantity, setQuantity] = useState("");
    const [city, setCity] = useState("");
    const [hazardous, setHazardous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchListings = async () => {
        if (!user) return;
        try {
            const q = query(collection(db, "wasteListings"), where("createdBy", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WasteListing[];
            setListings(data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        } catch (error) {
            console.error("Error fetching listings:", error);
            toast.error("Failed to load listings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, [user]);

    const handleAddListing = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!wasteType?.trim()) {
            toast.error("Please select a material type");
            return;
        }
        setIsSubmitting(true);
        try {
            const docRef = await addDoc(collection(db, "wasteListings"), {
                wasteType,
                quantity: parseFloat(quantity),
                city,
                hazardous,
                createdBy: user.uid,
                factoryId: user.uid,
                createdAt: serverTimestamp(),
            });

            toast.success("Listing created successfully!");

            // Trigger AI Matching
            try {
                await generateMatchesForWaste(docRef.id);
                toast.success("AI is analyzing potential matches...");
            } catch (matchError) {
                console.error("Matching error:", matchError);
            }

            // Reset form
            setWasteType("");
            setQuantity("");
            setCity("");
            setHazardous(false);
            setShowAddForm(false);
            fetchListings();
        } catch (error) {
            console.error("Error adding listing:", error);
            toast.error("Failed to create listing");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteListing = async (id: string) => {
        try {
            await deleteDoc(doc(db, "wasteListings", id));
            toast.success("Listing deleted");
            setListings(listings.filter(l => l.id !== id));
        } catch (error) {
            toast.error("Failed to delete listing");
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Material Inventory</h1>
                    <p className="text-slate-500 mt-1">Manage your industrial waste streams and surplus assets</p>
                </div>
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all font-semibold"
                >
                    {showAddForm ? "Cancel" : <><Plus className="h-5 w-5" /> New Listing</>}
                </Button>
            </div>

            {showAddForm && (
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 p-6">
                        <CardTitle className="text-lg font-bold text-slate-800">Create Asset Listing</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleAddListing} className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-slate-500">Material Type</Label>
                                    <Select value={wasteType || undefined} onValueChange={setWasteType}>
                                        <SelectTrigger id="type" className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl">
                                            <SelectValue placeholder="Select material type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {WASTE_TYPE_OPTIONS.map((opt) => (
                                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity" className="text-xs font-bold uppercase tracking-wider text-slate-500">Quantity (kg)</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        placeholder="500"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        required
                                        className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider text-slate-500">Origin City</Label>
                                    <Input
                                        id="city"
                                        placeholder="e.g. Mumbai, Bangalore"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        required
                                        className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                                    />
                                </div>
                                <div className="flex items-center gap-3 pt-8">
                                    <div
                                        className={`p-1.5 rounded-lg transition-colors ${hazardous ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"}`}
                                        onClick={() => setHazardous(!hazardous)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <Label className="text-sm font-bold text-slate-700">Hazardous Material</Label>
                                        <p className="text-xs text-slate-400">Mark if material requires specialized handling</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={hazardous}
                                        onChange={(e) => setHazardous(e.target.checked)}
                                        className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary"
                                    />
                                </div>
                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-xl shadow-slate-900/10"
                                    >
                                        {isSubmitting ? "Processing..." : "Publish to Marketplace"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-64 rounded-3xl bg-slate-50 animate-pulse border border-slate-100" />
                    ))
                ) : listings.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
                        <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Package className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">No active listings</h3>
                        <p className="text-slate-400 max-w-xs mx-auto mt-2">Start by listing your industrial surplus to find matching circular economy partners.</p>
                        <Button
                            variant="outline"
                            className="mt-6 border-slate-200 hover:bg-slate-50"
                            onClick={() => setShowAddForm(true)}
                        >
                            Post First Asset
                        </Button>
                    </div>
                ) : (
                    listings.map((item) => (
                        <Card key={item.id} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] group overflow-hidden hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all duration-300">
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                                            <Package className="h-6 w-6" />
                                        </div>
                                        {item.hazardous ? (
                                            <span className="bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-amber-100">Hazardous</span>
                                        ) : (
                                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-100 whitespace-nowrap overflow-hidden">Verified Safe</span>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-1 capitalize truncate">{item.wasteType}</h3>
                                    <div className="flex items-center gap-1.5 text-slate-400 text-sm mb-6">
                                        <MapPin className="h-3.5 w-3.5" /> {item.city}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Quantity</p>
                                            <p className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                                                <Scale className="h-4 w-4 text-primary" /> {item.quantity} kg
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">AI Status</p>
                                            <p className="text-sm font-bold text-emerald-500 flex items-center justify-end gap-1">
                                                <CheckCircle2 className="h-4 w-4" /> Active
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 px-6 py-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs font-semibold text-slate-400">Created {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                        onClick={() => handleDeleteListing(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default WasteListings;
