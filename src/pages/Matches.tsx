import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { calculateMatch, type WasteListing, type MatchResult } from "@/lib/matching";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, MapPin, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Matches = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<(MatchResult & { listing: WasteListing })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) return;
    const run = async () => {
      setLoading(true);
      // Get user's listings
      const mySnap = await getDocs(query(collection(db, "wasteListings"), where("factoryId", "==", user.uid)));
      const myListings = mySnap.docs.map((d) => ({ id: d.id, ...d.data() } as WasteListing));

      // Get all other listings
      const allSnap = await getDocs(collection(db, "wasteListings"));
      const otherListings = allSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as WasteListing))
        .filter((l) => l.factoryId !== user.uid);

      // Run matching
      const results: (MatchResult & { listing: WasteListing })[] = [];
      for (const my of myListings) {
        for (const other of otherListings) {
          const match = calculateMatch(my, other);
          if (match && match.compatibilityScore > 20) {
            results.push({ ...match, listing: other });
          }
        }
      }
      results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      setMatches(results);
      setLoading(false);
    };
    run();
  }, [user, profile]);

  const createDeal = async (match: MatchResult & { listing: WasteListing }) => {
    if (!user) return;
    await addDoc(collection(db, "deals"), {
      wasteListingId: match.wasteListingId,
      buyerFactoryId: match.buyerFactoryId,
      sellerFactoryId: user.uid,
      wasteType: match.wasteType,
      status: "pending",
      co2Saved: match.co2Saved,
      distanceKm: match.distanceKm,
      compatibilityScore: match.compatibilityScore,
      createdAt: serverTimestamp(),
    });
    toast({ title: "Deal created!", description: "A new deal has been initiated." });
    navigate("/dashboard/deals");
  };

  const scoreColor = (s: number) => s >= 70 ? "text-success" : s >= 40 ? "text-accent" : "text-muted-foreground";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-accent" /> AI-Powered Matches
        </h1>
        <p className="text-muted-foreground">Automatically matched based on material, proximity, and quantity.</p>
      </div>

      {loading ? (
        <div className="text-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" /></div>
      ) : matches.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No matches found yet. Create waste listings to get started!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((m, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="py-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold capitalize">{m.wasteType}</h3>
                      <Badge variant="outline">{m.listing.frequency}</Badge>
                      {m.listing.hazardous && <Badge variant="destructive">Hazardous</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Factory: <span className="font-medium text-foreground">{m.buyerFactoryName || "Unknown"}</span>
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {m.distanceKm} km away</span>
                      <span>Qty: {m.listing.quantity} {m.listing.unit}</span>
                      <span>Qty Match: {m.quantityMatch}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${scoreColor(m.compatibilityScore)}`}>{m.compatibilityScore}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                    <Button onClick={() => createDeal(m)} size="sm">
                      Initiate Deal <ArrowRight className="ml-1 h-4 w-4" />
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
