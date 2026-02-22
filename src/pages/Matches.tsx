import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Package,
  Users,
  MapPin,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { MOCK_PRODUCERS, MOCK_CONSUMERS, MockCompany } from "@/data/mockCompanies";
import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

type ViewType = "producers" | "consumers";

const Matches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [view, setView] = useState<ViewType>("producers");
  const [loading, setLoading] = useState(false);

  // modal
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<MockCompany | null>(null);

  // form fields
  const [rate, setRate] = useState("");
  const [quantity, setQuantity] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [dispatchBy, setDispatchBy] = useState("");

  const data =
    view === "producers" ? MOCK_PRODUCERS : MOCK_CONSUMERS;

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Matches refreshed");
    }, 800);
  };

  const openDealForm = (company: MockCompany) => {
    setSelectedCompany(company);
    setRate(String(company.pricePerKg));
    setQuantity(String(company.quantity));
    setAvailableFrom("");
    setDispatchBy("");
    setShowModal(true);
  };

  const submitDeal = async () => {
    if (!user || !selectedCompany) return;

    if (!rate || !quantity || !availableFrom || !dispatchBy) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      await addDoc(collection(db, "deals"), {
        sellerFactoryId: user.uid,                 // ✅ required by Deals.tsx
        buyerFactoryId: null,
        partnerCompanyName: selectedCompany.companyName,
        wasteType: selectedCompany.materialType,
        pricePerKg: Number(rate),
        quantity: Number(quantity),
        availableFrom,
        dispatchBy,
        status: "pending",
        co2Saved: Math.round(Number(quantity) * 0.5),
        createdAt: serverTimestamp(),
      });

      toast.success("Deal request sent (Pending)");
      setShowModal(false);
      navigate("/dashboard/deals");
    } catch (err) {
      console.error(err);
      toast.error("Failed to initiate deal");
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2">
            <Sparkles className="h-4 w-4" /> AI Matchmaking (Demo)
          </div>
          <h1 className="text-3xl font-bold text-slate-900">AI Matches</h1>
          <p className="text-slate-500 mt-1">
            Demo marketplace using mock industrial data
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* TOGGLE */}
      <div className="flex rounded-xl bg-slate-100 p-1 w-fit">
        <button
          onClick={() => setView("producers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold ${
            view === "producers"
              ? "bg-white shadow text-slate-900"
              : "text-slate-600"
          }`}
        >
          <Package className="h-4 w-4" /> Producers
        </button>
        <button
          onClick={() => setView("consumers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold ${
            view === "consumers"
              ? "bg-white shadow text-slate-900"
              : "text-slate-600"
          }`}
        >
          <Users className="h-4 w-4" /> Consumers
        </button>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {data.map((company) => {
          const dealValue = company.quantity * company.pricePerKg;

          return (
            <Card key={company.id} className="rounded-[2rem] shadow">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{company.companyName}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <MapPin className="h-4 w-4" /> {company.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary">
                      {85 + (company.quantity % 15)}%
                    </p>
                    <p className="text-xs text-slate-400 uppercase">
                      Compatibility
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-400">Material</p>
                    <p className="font-semibold">{company.materialType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Quantity</p>
                    <p className="font-semibold">{company.quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Rate</p>
                    <p className="font-semibold">₹{company.pricePerKg}/kg</p>
                  </div>
                </div>

                {[
                  "Material compatibility verified",
                  "Location within optimal range",
                  "Industrial capacity matched",
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {r}
                  </div>
                ))}

                <div className="border-t pt-4">
                  <p className="text-xs text-slate-400">Projected value</p>
                  <p className="text-xl font-black">
                    ₹{dealValue.toLocaleString()}
                  </p>
                </div>

                <Button
                  className="w-full h-12 rounded-2xl font-bold"
                  onClick={() => openDealForm(company)}
                >
                  Initiate Deal <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* MODAL */}
      {showModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>

            <h2 className="text-xl font-bold mb-4">
              Initiate Deal – {selectedCompany.materialType}
            </h2>

            <div className="space-y-3">
              <Input placeholder="Rate (₹/kg)" value={rate} onChange={(e) => setRate(e.target.value)} />
              <Input placeholder="Quantity (kg)" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
              <Input type="date" value={availableFrom} onChange={(e) => setAvailableFrom(e.target.value)} />
            </div>

            <Button className="w-full mt-6" onClick={submitDeal}>
              Send Deal Request
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Matches;