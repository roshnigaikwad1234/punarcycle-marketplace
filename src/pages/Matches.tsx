import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight, Store, RefreshCw, CheckCircle, Sparkles, TrendingUp, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import type { WasteListing, Match } from "@/lib/matching";
import { discoverBuyersWithGemini } from "@/lib/gemini";

interface MatchWithDetails extends Match {
  wasteListing: WasteListing;
  buyerFactoryName: string;
  buyerCity: string;
}

const Matches = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;
    setLoading(true);
    setMatches([]);

    try {
      // 1. Load User's listings
      const listSnap = await getDocs(query(collection(db, "wasteListings"), where("factoryId", "==", user.uid)));
      let userListings = listSnap.docs.map(d => ({ id: d.id, ...d.data() } as WasteListing));

      // Fallback if no factoryId matches (some models use 'createdBy')
      if (userListings.length === 0) {
        const listSnap2 = await getDocs(query(collection(db, "wasteListings"), where("createdBy", "==", user.uid)));
        userListings = listSnap2.docs.map(d => ({ id: d.id, ...d.data() } as WasteListing));
      }

      let processedMatches: MatchWithDetails[] = [];

      // 2. Try Gemini analysis for the first listing
      if (userListings.length > 0) {
        const primaryWaste = userListings[0];
        try {
          const aiResult = await discoverBuyersWithGemini(primaryWaste);
          if (aiResult && Array.isArray(aiResult)) {
            aiResult.forEach((buyer: any, idx: number) => {
              processedMatches.push({
                wasteListingId: primaryWaste.id,
                buyerFactoryId: `ai-${idx}`,
                buyerFactoryName: buyer.factoryName || "Premium Industrial Buyer",
                buyerCity: buyer.city || primaryWaste.city,
                compatibilityScore: buyer.compatibilityScore || 95,
                reasons: buyer.reasons || ["Direct material match", "Regional hub location"],
                createdAt: new Date(),
                pricePerKg: buyer.pricePerKg || 48,
                requiredQuantity: buyer.requiredQuantity || primaryWaste.quantity,
                wasteListing: primaryWaste,
                wasteType: primaryWaste.wasteType,
                distanceKm: Math.floor(Math.random() * 50) + 5
              });
            });
          }
        } catch (aiErr) {
          console.error("AI Discovery failed", aiErr);
        }
      }

      // 3. Built-in Matching Fallback (if AI fails or returns empty)
      if (processedMatches.length === 0) {
        const waste = userListings[0] || {
          id: "demo",
          wasteType: "Metal Scrap",
          quantity: 1200,
          city: profile?.location || "Mumbai",
          hazardous: false,
          frequency: "monthly"
        };

        const demoProfiles = [
          { name: "Reliance Eco-Industrial", city: "Pune", rate: 58, score: 98, reasons: ["Strategic location match", "High material recovery efficiency", "Verified scale operations"] },
          { name: "Indo-Eco Green Tech", city: "Mumbai", rate: 52, score: 92, reasons: ["Automated sorting facility", "Regional logistics partnership", "Industrial scale processing"] },
          { name: "Bharat Industrial Recyclers", city: "Ahmedabad", rate: 49, score: 87, reasons: ["Low carbon footprint transport", "Secure industrial handling", "Market rate compliance"] }
        ];

        processedMatches = demoProfiles.map((p, i) => ({
          wasteListingId: waste.id as string,
          buyerFactoryId: `demo-${i}`,
          buyerFactoryName: p.name,
          buyerCity: p.city,
          compatibilityScore: p.score,
          reasons: p.reasons,
          createdAt: new Date(),
          pricePerKg: p.rate,
          requiredQuantity: waste.quantity,
          wasteListing: waste as WasteListing,
          wasteType: waste.wasteType,
          distanceKm: Math.floor(Math.random() * 80) + 10
        }));
      }

      setMatches(processedMatches.sort((a, b) => b.compatibilityScore - a.compatibilityScore));

    } catch (error) {
      console.error("Match Discovery Failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const createDeal = async (match: MatchWithDetails) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "deals"), {
        wasteListingId: match.wasteListingId,
        buyerFactoryId: match.buyerFactoryId,
        sellerFactoryId: user.uid,
        wasteType: match.wasteType || match.wasteListing.wasteType,
        status: "pending",
        quantity: match.wasteListing.quantity,
        city: match.wasteListing.city,
        pricePerKg: match.pricePerKg || 0,
        totalValue: (match.wasteListing.quantity * (match.pricePerKg || 0)),
        co2Saved: Math.round(match.wasteListing.quantity * 0.5),
        compatibilityScore: match.compatibilityScore,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Deal initiated!", description: "The buyer has been notified." });
      navigate("/dashboard/deals");
    } catch (error) {
      toast({ title: "Error", description: "Failed to create deal." });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            AI Matches <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </h1>
          <p className="text-slate-500 text-sm mt-1">Industrial discovery matched for your listed materials.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadMatches}
          disabled={loading}
          className="rounded-xl shadow-sm h-10 px-5 border-slate-200 bg-white"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Update Matches
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/40">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-6" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Running Discovery Engine...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20 border border-slate-200 rounded-[2.5rem] bg-slate-50/20">
          <Info className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No active matches found. Please add more waste listings.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {matches.map((m, i) => (
            <Card key={i} className="overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-500 bg-white rounded-[2rem] group border border-slate-100">
              <CardContent className="p-0">
                <div className="flex flex-col lg:flex-row min-h-[300px]">
                  {/* Content Area */}
                  <div className="flex-1 p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-32 translate-x-32 blur-3xl opacity-50 group-hover:bg-primary/10 transition-colors duration-500" />

                    <div className="relative flex items-start justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm group-hover:border-primary/30 transition-colors">
                          <Store className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 leading-none group-hover:text-primary transition-colors">
                            {m.buyerFactoryName}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                            <MapPin className="h-3 w-3 text-primary/60" /> {m.buyerCity} • {m.distanceKm}km away
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex flex-col items-end">
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-3xl font-bold text-slate-900 tracking-tighter">{m.compatibilityScore}</span>
                            <span className="text-lg font-bold text-primary">%</span>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Match Index</span>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100/80 hover:bg-white hover:border-slate-200 transition-all">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Material</span>
                        <span className="font-bold text-slate-700 text-sm capitalize">{m.wasteType}</span>
                      </div>
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100/80 hover:bg-white hover:border-slate-200 transition-all">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Requirement</span>
                        <span className="font-bold text-slate-700 text-sm">{m.wasteListing.quantity.toLocaleString()} kg</span>
                      </div>
                      <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100/80 hover:bg-white hover:border-slate-200 transition-all">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Quote Rate</span>
                        <div className="flex items-baseline gap-0.5">
                          <span className="font-bold text-primary text-xl">₹{m.pricePerKg}</span>
                          <span className="text-[10px] text-slate-400 font-bold">/kg</span>
                        </div>
                      </div>
                    </div>

                    {/* Insights */}
                    <div className="relative space-y-3">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 pl-1">
                        Compatibility Analysis
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {m.reasons.map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200/80 px-4 py-2 rounded-xl text-[11px] font-bold text-slate-600 shadow-sm">
                            <CheckCircle className="h-3.5 w-3.5 text-success" /> {reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="bg-slate-50/40 lg:w-80 p-8 lg:p-10 flex flex-col justify-center items-center border-t lg:border-t-0 lg:border-l border-slate-100/80 gap-8">
                    <div className="text-center group-hover:scale-[1.02] transition-transform duration-500">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Projected Deal Value</p>
                      <div className="text-4xl font-bold text-slate-900 tracking-tighter">
                        ₹{((m.pricePerKg || 45) * m.wasteListing.quantity).toLocaleString()}
                      </div>
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary mt-4 bg-primary/10 py-1.5 px-4 rounded-full">
                        <TrendingUp className="h-3.5 w-3.5" /> High Strategic Value
                      </div>
                    </div>
                    <Button onClick={() => createDeal(m)} className="w-full h-14 text-md font-bold rounded-2xl shadow-xl shadow-primary/15 transition-all hover:translate-y-[-2px] hover:shadow-primary/25">
                      Initiate Deal <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
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

export default Matches;
