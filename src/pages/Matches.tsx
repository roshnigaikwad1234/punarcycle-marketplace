import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, CheckCircle2, Factory, Sparkles, Users, Package, MapPin, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  MOCK_CONSUMERS,
  MOCK_PRODUCERS,
  filterConsumersByRequirement,
  filterProducersByWaste,
  scoreConsumerMatch,
  scoreProducerMatch,
} from "@/data/mockCompanies";
import { getSampleAiMatches } from "@/lib/gemini";

interface ProducerMatchCard {
  id: string;
  companyName: string;
  city: string;
  pricePerKg: number;
  quantity: number;
  compatibilityScore: number;
  reasons: string[];
  wasteType?: string;
  wasteQuantity?: number;
  wasteCity?: string;
  isSample?: boolean;
}

interface ConsumerMatchCard {
  id: string;
  companyName: string;
  city: string;
  pricePerKg: number;
  quantity: number;
  compatibilityScore: number;
  reasons: string[];
  requirementMaterial?: string;
  requirementQuantity?: number;
  requirementLocation?: string;
  isSample?: boolean;
}

type MatchView = "producers" | "consumers";

const Matches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<MatchView>("producers");
  const [producerMatches, setProducerMatches] = useState<ProducerMatchCard[]>([]);
  const [consumerMatches, setConsumerMatches] = useState<ConsumerMatchCard[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducerMatches = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const wasteSnap = await getDocs(
        query(collection(db, "wasteListings"), where("createdBy", "==", user.uid))
      );
      const wasteListings = wasteSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{
        wasteType: string;
        quantity: number;
        city: string;
      }>;

      const seen = new Set<string>();
      const producerCards: ProducerMatchCard[] = [];
      for (const w of wasteListings) {
        const req = { materialType: w.wasteType, quantity: w.quantity, location: w.city };
        const matched = filterConsumersByRequirement(MOCK_CONSUMERS, req);
        for (const c of matched) {
          if (seen.has(c.id)) continue;
          seen.add(c.id);
          const { score, reasons } = scoreConsumerMatch(c, w);
          producerCards.push({
            id: c.id,
            companyName: c.companyName,
            city: c.city,
            pricePerKg: c.pricePerKg,
            quantity: c.quantity,
            compatibilityScore: score,
            reasons,
            wasteType: w.wasteType,
            wasteQuantity: w.quantity,
            wasteCity: w.city,
          });
        }
      }
      if (producerCards.length > 0) {
        setProducerMatches(producerCards.sort((a, b) => b.compatibilityScore - a.compatibilityScore));
      } else {
        const samples = await getSampleAiMatches("producer");
        if (samples && samples.length > 0) {
          const cards: ProducerMatchCard[] = samples.map((s: Record<string, unknown>, i: number) => ({
            id: `sample-prod-${i}`,
            companyName: String(s.companyName ?? "Industrial Partner"),
            city: String(s.city ?? "—").toUpperCase(),
            pricePerKg: Number(s.pricePerKg) || 50,
            quantity: Number(s.quantity) || 1000,
            compatibilityScore: Number(s.compatibilityScore) || 90,
            reasons: Array.isArray(s.reasons) ? (s.reasons as string[]) : ["Strategic location match", "High material recovery efficiency", "Verified scale operations"],
            wasteType: s.materialType ? String(s.materialType) : undefined,
            isSample: true,
          }));
          setProducerMatches(cards);
        } else {
          setProducerMatches([
            { id: "fallback-1", companyName: "Reliance Eco-Industrial", city: "PUNE", pricePerKg: 58, quantity: 1000, compatibilityScore: 98, reasons: ["Strategic location match", "High material recovery efficiency", "Verified scale operations"], wasteType: "Textile Waste", isSample: true },
            { id: "fallback-2", companyName: "Tata Circular Solutions", city: "MUMBAI", pricePerKg: 45, quantity: 2000, compatibilityScore: 92, reasons: ["Material type alignment", "Capacity fit", "Regional logistics"], wasteType: "Plastic scrap", isSample: true },
          ]);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not load producer matches");
      setProducerMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadProducerMatches();
  }, [user]);

  const loadConsumerMatches = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const reqSnap = await getDocs(
        query(collection(db, "consumerRequirements"), where("createdBy", "==", user.uid))
      );
      const requirements = reqSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Array<{
        materialType: string;
        quantity: number;
        location: string;
      }>;

      const seen = new Set<string>();
      const consumerCards: ConsumerMatchCard[] = [];
      for (const req of requirements) {
        const waste = { wasteType: req.materialType, quantity: req.quantity, city: req.location };
        const matched = filterProducersByWaste(MOCK_PRODUCERS, waste);
        for (const p of matched) {
          if (seen.has(p.id)) continue;
          seen.add(p.id);
          const { score, reasons } = scoreProducerMatch(p, req);
          consumerCards.push({
            id: p.id,
            companyName: p.companyName,
            city: p.city,
            pricePerKg: p.pricePerKg,
            quantity: p.quantity,
            compatibilityScore: score,
            reasons,
            requirementMaterial: req.materialType,
            requirementQuantity: req.quantity,
            requirementLocation: req.location,
          });
        }
      }
      if (consumerCards.length > 0) {
        setConsumerMatches(consumerCards.sort((a, b) => b.compatibilityScore - a.compatibilityScore));
      } else {
        const samples = await getSampleAiMatches("consumer");
        if (samples && samples.length > 0) {
          const cards: ConsumerMatchCard[] = samples.map((s: Record<string, unknown>, i: number) => ({
            id: `sample-cons-${i}`,
            companyName: String(s.companyName ?? "Industrial Supplier"),
            city: String(s.city ?? "—").toUpperCase(),
            pricePerKg: Number(s.pricePerKg) || 50,
            quantity: Number(s.quantity) || 1000,
            compatibilityScore: Number(s.compatibilityScore) || 90,
            reasons: Array.isArray(s.reasons) ? (s.reasons as string[]) : ["Strategic location match", "High material recovery efficiency", "Verified scale operations"],
            requirementMaterial: s.materialType ? String(s.materialType) : undefined,
            isSample: true,
          }));
          setConsumerMatches(cards);
        } else {
          setConsumerMatches([
            { id: "fallback-c1", companyName: "Green Supply Co", city: "BANGALORE", pricePerKg: 52, quantity: 1500, compatibilityScore: 95, reasons: ["Strategic location match", "High material recovery efficiency", "Verified scale operations"], requirementMaterial: "Steel slag", isSample: true },
            { id: "fallback-c2", companyName: "Eco Materials Ltd", city: "CHENNAI", pricePerKg: 48, quantity: 800, compatibilityScore: 90, reasons: ["Material type alignment", "Capacity fit", "Regional logistics"], requirementMaterial: "Cotton waste", isSample: true },
          ]);
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("Could not load consumer matches");
      setConsumerMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view !== "consumers" || !user) return;
    loadConsumerMatches();
  }, [view, user]);

  const handleRefresh = () => {
    if (view === "producers") loadProducerMatches();
    else loadConsumerMatches();
  };

  const handleInitiateDeal = async (match: ProducerMatchCard | ConsumerMatchCard) => {
    if (!user) return;
    const materialLabel = "wasteType" in match ? match.wasteType : (match as ConsumerMatchCard).requirementMaterial || "Material";
    const projectedValue = match.quantity * match.pricePerKg;
    try {
      await addDoc(collection(db, "deals"), {
        status: "pending",
        sellerFactoryId: user.uid,
        buyerFactoryId: null,
        partnerCompanyName: match.companyName,
        wasteType: materialLabel,
        quantity: match.quantity,
        pricePerKg: match.pricePerKg,
        co2Saved: Math.round(match.quantity * 0.5),
        createdAt: serverTimestamp(),
      });
      toast.success(`Request sent to ${match.companyName}. Check Deals for status.`);
      navigate("/dashboard/deals");
    } catch (e) {
      console.error(e);
      toast.error("Failed to send request");
    }
  };

  const showProducerEmpty = view === "producers" && !loading && producerMatches.length === 0;
  const showConsumerEmpty = view === "consumers" && !loading && consumerMatches.length === 0;
  const showProducerList = view === "producers" && producerMatches.length > 0;
  const showConsumerList = view === "consumers" && consumerMatches.length > 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em] mb-2">
              <Sparkles className="h-3.5 w-3.5" /> AI Matchmaking Engine
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Matches</h1>
            <p className="text-slate-500 mt-1">Real-time industrial matchmaking for your materials</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live
            </div>
            <Button variant="outline" onClick={handleRefresh} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh Matches
            </Button>
          </div>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1 w-fit">
          <button
            type="button"
            onClick={() => setView("producers")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${view === "producers" ? "bg-white text-slate-900 shadow" : "text-slate-600 hover:text-slate-900"}`}
          >
            <Package className="h-4 w-4" /> Producers
          </button>
          <button
            type="button"
            onClick={() => setView("consumers")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${view === "consumers" ? "bg-white text-slate-900 shadow" : "text-slate-600 hover:text-slate-900"}`}
          >
            <Users className="h-4 w-4" /> Consumers
          </button>
        </div>
      </div>

      {view === "producers" && loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="h-80 rounded-[2rem] bg-slate-50 animate-pulse border border-slate-100" />
          ))}
        </div>
      )}

      {view === "consumers" && loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="h-80 rounded-[2rem] bg-slate-50 animate-pulse border border-slate-100" />
          ))}
        </div>
      )}

      {showProducerEmpty && (
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-12 text-center rounded-[2rem]">
          <div className="h-20 w-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Zap className="h-10 w-10 text-primary opacity-20" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No producer matches yet</h3>
          <p className="text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
            Add waste listings (material, quantity, location) so we can show only companies that match your supply.
          </p>
        </Card>
      )}

      {showConsumerEmpty && (
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-12 text-center rounded-[2rem]">
          <div className="h-20 w-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users className="h-10 w-10 text-primary opacity-20" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No consumer matches</h3>
          <p className="text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
            Add your needs in Consumer Requirements to see only companies that match (material, quantity, location).
          </p>
        </Card>
      )}

      {showProducerList && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {producerMatches.map((match) => {
            const projectedValue = match.quantity * match.pricePerKg;
            const materialLabel = match.wasteType || "Material";
            return (
              <Card key={match.id} className="border-none shadow-[0_20px_50px_rgb(0,0,0,0.04)] overflow-hidden group hover:shadow-[0_30px_60px_rgb(0,0,0,0.08)] transition-all duration-500 rounded-[2rem]">
                <CardContent className="p-0">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Factory className="h-5 w-5" />
                          <span className="text-lg font-bold text-slate-900">{match.companyName}</span>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {match.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary">{match.compatibilityScore}%</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compatibility</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Material</p>
                        <p className="text-sm font-bold text-slate-800 capitalize">{materialLabel}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                        <p className="text-sm font-bold text-slate-800">{match.quantity.toLocaleString()} kg</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Listing rate</p>
                        <p className="text-sm font-bold text-slate-800">₹{match.pricePerKg} / kg</p>
                      </div>
                    </div>
                    <div className="space-y-3 mb-6">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engineering insights</p>
                      <div className="grid gap-2">
                        {(match.reasons || []).map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="py-4 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Projected deal value</p>
                      <p className="text-xl font-black text-slate-900">₹{projectedValue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <Button onClick={() => handleInitiateDeal(match)} className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold transition-all">
                      Initiate Deal <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showConsumerList && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {consumerMatches.map((match) => {
            const projectedValue = match.quantity * match.pricePerKg;
            const materialLabel = match.requirementMaterial || "Material";
            return (
              <Card key={match.id} className="border-none shadow-[0_20px_50px_rgb(0,0,0,0.04)] overflow-hidden group hover:shadow-[0_30px_60px_rgb(0,0,0,0.08)] transition-all duration-500 rounded-[2rem]">
                <CardContent className="p-0">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="h-5 w-5" />
                          <span className="text-lg font-bold text-slate-900">{match.companyName}</span>
                        </div>
                        <p className="text-sm text-slate-500 flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {match.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary">{match.compatibilityScore}%</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compatibility</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Material</p>
                        <p className="text-sm font-bold text-slate-800 capitalize">{materialLabel}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Capacity</p>
                        <p className="text-sm font-bold text-slate-800">{match.quantity.toLocaleString()} kg</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Listing rate</p>
                        <p className="text-sm font-bold text-slate-800">₹{match.pricePerKg} / kg</p>
                      </div>
                    </div>
                    <div className="space-y-3 mb-6">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engineering insights</p>
                      <div className="grid gap-2">
                        {(match.reasons || []).map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm text-slate-700">
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="py-4 border-t border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Projected deal value</p>
                      <p className="text-xl font-black text-slate-900">₹{projectedValue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <Button onClick={() => handleInitiateDeal(match)} className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold transition-all">
                      Initiate Deal <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Matches;
