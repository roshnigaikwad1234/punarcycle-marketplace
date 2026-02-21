import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Zap, Handshake, Leaf, TrendingUp, ArrowUpRight, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from "recharts";

const COLORS = ["hsl(153,60%,37%)", "hsl(215,25%,27%)", "hsl(217,91%,60%)", "hsl(38,92%,50%)"];

const DashboardHome = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ listings: 0, matches: 0, deals: 0, co2: 0 });
  const [impactData, setImpactData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const listSnap = await getDocs(query(collection(db, "wasteListings"), where("factoryId", "==", user.uid)));
      const dealSnap = await getDocs(query(collection(db, "deals")));

      let totalCo2 = 0;
      let dealCount = 0;
      dealSnap.forEach((d) => {
        const data = d.data();
        if (data.buyerFactoryId === user.uid || data.sellerFactoryId === user.uid) {
          dealCount++;
          if (data.status === "completed") totalCo2 += data.co2Saved || 0;
        }
      });

      setStats({
        listings: listSnap.size,
        matches: 3, // Simulated AI matches for dashboard
        deals: dealCount,
        co2: totalCo2,
      });

      // Mock impact trend data
      setImpactData([
        { name: 'Mon', value: 400 },
        { name: 'Tue', value: 300 },
        { name: 'Wed', value: 600 },
        { name: 'Thu', value: 800 },
        { name: 'Fri', value: 500 },
        { name: 'Sat', value: 900 },
        { name: 'Sun', value: 1100 },
      ]);
    };
    load();
  }, [user]);

  const cards = [
    { icon: Package, label: "Asset Inventory", value: stats.listings, sub: "Active Listings", color: "text-slate-600" },
    { icon: Zap, label: "AI Match Potential", value: stats.matches, sub: "Strategic Partners", color: "text-primary" },
    { icon: Handshake, label: "Transaction Pipeline", value: stats.deals, sub: "Pending/Active", color: "text-slate-600" },
    { icon: Leaf, label: "Carbon Offset", value: stats.co2, sub: "Total kg CO₂-e", color: "text-primary" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Enterprise Console</h1>
          <p className="text-slate-500 mt-1">Industrial overview for <span className="text-slate-900 font-semibold">{profile?.name || "Corporate Account"}</span></p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Platform Status: Operational
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <Card key={i} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl bg-slate-50 group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all ${c.color}`}>
                  <c.icon className="h-5 w-5" />
                </div>
                {i === 1 && <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px]">High Value</Badge>}
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold text-slate-900 tracking-tight">{c.value}</p>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{c.label}</p>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-3 font-medium">
                  <TrendingUp className="h-3 w-3 text-primary" /> {c.sub}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-2">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Sustainability Impact Trend
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-slate-400 font-bold uppercase tracking-widest">Reports <ArrowUpRight className="ml-1 h-3 w-3" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={impactData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(153,60%,37%)" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="hsl(153,60%,37%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(153,60%,37%)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-lg font-bold">Strategic Actions</CardTitle>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Recommended Workflows</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {[
              { label: "Publish Material Listing", color: "bg-primary/5 text-primary", icon: Package },
              { label: "Analyze AI Partner Match", color: "bg-amber-50 text-amber-600", icon: Zap },
              { label: "View ESG Performance", color: "bg-blue-50 text-blue-600", icon: TrendingUp },
            ].map((a, i) => (
              <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-slate-100/50 transition-all group">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${a.color}`}>
                    <a.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">{a.label}</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
              </button>
            ))}
            <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative">
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Industrial Insights</p>
                <p className="mt-2 text-sm font-medium leading-relaxed">Optimization potential: You could save <span className="text-primary font-bold">42% more</span> CO₂ by switching to local metal recycling partners.</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full translate-x-10 -translate-y-10 blur-2xl" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
