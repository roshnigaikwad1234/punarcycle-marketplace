import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Zap, Handshake, ArrowRight, FileText, Store, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Link } from "react-router-dom";

const DashboardHome = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ listings: 0, matches: 0, dealsPending: 0, dealsActive: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const listSnap = await getDocs(query(collection(db, "wasteListings"), where("createdBy", "==", user.uid)));
      const reqSnap = await getDocs(query(collection(db, "consumerRequirements"), where("createdBy", "==", user.uid)));
      const dealSnap = await getDocs(query(collection(db, "deals")));

      let dealPending = 0;
      let dealActive = 0;
      dealSnap.forEach((d) => {
        const data = d.data();
        if (data.sellerFactoryId === user.uid || data.buyerFactoryId === user.uid) {
          if (data.status === "pending") dealPending++;
          else if (data.status !== "completed" && data.status !== "cancelled") dealActive++;
        }
      });

      const matchSnap = await getDocs(query(collection(db, "matches")));
      let matchCount = 0;
      const userListingIds = new Set(listSnap.docs.map((doc) => doc.id));
      matchSnap.forEach((d) => {
        const data = d.data();
        if (data.buyerFactoryId === user.uid || userListingIds.has(data.wasteListingId)) matchCount++;
      });

      setStats({
        listings: listSnap.size,
        matches: matchCount,
        dealsPending: dealPending,
        dealsActive: dealActive,
      });
    };
    load();
  }, [user]);

  const companyName = profile?.name || "your company";
  const isNewUser = stats.listings === 0 && stats.dealsPending === 0 && stats.dealsActive === 0;

  const cards = [
    { icon: Package, label: "Waste Listings", value: stats.listings, sub: "Active listings", link: "/dashboard/listings", color: "text-slate-600" },
    { icon: Zap, label: "AI Matches", value: stats.matches, sub: "Potential partners", link: "/dashboard/matches", color: "text-primary" },
    { icon: Handshake, label: "Deals", value: stats.dealsPending + stats.dealsActive, sub: `${stats.dealsPending} pending · ${stats.dealsActive} active`, link: "/dashboard/deals", color: "text-slate-600" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Welcome, {companyName}
        </h1>
        <p className="text-slate-500">
          {isNewUser
            ? "Get started by adding waste listings or consumer requirements to find matches."
            : "Here’s a quick overview of your activity."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <Link key={i} to={c.link}>
            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all h-full">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-xl bg-slate-50 group-hover:bg-primary/5 border border-transparent transition-all ${c.color}`}>
                    <c.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors mt-1" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-slate-900 tracking-tight">{c.value}</p>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{c.label}</p>
                  <p className="text-xs text-slate-500 mt-2 font-medium">{c.sub}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {isNewUser ? (
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <CardContent className="p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Getting started</h2>
            <p className="text-slate-500 text-sm mb-6">Add your first listing or requirement to see matches and deals here.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link to="/dashboard/listings">
                <Button variant="outline" className="w-full h-12 justify-start gap-3 rounded-xl border-slate-200 hover:bg-slate-50">
                  <Package className="h-5 w-5 text-primary" />
                  Add waste listing
                </Button>
              </Link>
              <Link to="/dashboard/consumer-requirements">
                <Button variant="outline" className="w-full h-12 justify-start gap-3 rounded-xl border-slate-200 hover:bg-slate-50">
                  <FileText className="h-5 w-5 text-primary" />
                  Add consumer requirement
                </Button>
              </Link>
              <Link to="/dashboard/marketplace">
                <Button variant="outline" className="w-full h-12 justify-start gap-3 rounded-xl border-slate-200 hover:bg-slate-50">
                  <Store className="h-5 w-5 text-primary" />
                  Browse marketplace
                </Button>
              </Link>
              <Link to="/dashboard/matches">
                <Button variant="outline" className="w-full h-12 justify-start gap-3 rounded-xl border-slate-200 hover:bg-slate-50">
                  <Zap className="h-5 w-5 text-primary" />
                  View AI Matches
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <CardContent className="p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Quick actions</h2>
            <p className="text-slate-500 text-sm mb-6">Jump to the section you need.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard/listings">
                <Button variant="outline" size="sm" className="rounded-xl gap-2">
                  <Package className="h-4 w-4" /> Listings
                </Button>
              </Link>
              <Link to="/dashboard/consumer-requirements">
                <Button variant="outline" size="sm" className="rounded-xl gap-2">
                  <FileText className="h-4 w-4" /> Requirements
                </Button>
              </Link>
              <Link to="/dashboard/marketplace">
                <Button variant="outline" size="sm" className="rounded-xl gap-2">
                  <Store className="h-4 w-4" /> Marketplace
                </Button>
              </Link>
              <Link to="/dashboard/matches">
                <Button variant="outline" size="sm" className="rounded-xl gap-2">
                  <Zap className="h-4 w-4" /> AI Matches
                </Button>
              </Link>
              <Link to="/dashboard/deals">
                <Button variant="outline" size="sm" className="rounded-xl gap-2">
                  <Handshake className="h-4 w-4" /> Deals
                </Button>
              </Link>
              <Link to="/dashboard/forecasting">
                <Button variant="outline" size="sm" className="rounded-xl gap-2">
                  <TrendingUp className="h-4 w-4" /> Forecasting
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardHome;
