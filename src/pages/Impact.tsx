import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Droplets, Zap as ZapIcon, Trash, BarChart3, Globe, ShieldCheck, TrendingUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

const Impact = () => {
  const { user } = useAuth();
  const [totals, setTotals] = useState({ co2: 0, waste: 0, energy: 0, deals: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "deals"));
        let co2 = 0, waste = 0, energy = 0, completed = 0;
        const monthly: Record<string, number> = {};

        snap.docs.forEach((d) => {
          const data = d.data();
          if ((data.buyerFactoryId === user.uid || data.sellerFactoryId === user.uid) && data.status === "completed") {
            const quantity = data.quantity || 0;
            const savedCo2 = data.co2Saved || (quantity * 0.5);
            co2 += savedCo2;
            waste += quantity;
            energy += (quantity * 0.3);
            completed++;

            const date = data.createdAt?.toDate?.() || new Date();
            const month = date.toLocaleString("default", { month: "short" });
            monthly[month] = (monthly[month] || 0) + savedCo2;
          }
        });

        setTotals({
          co2: Math.round(co2),
          waste: Math.round(waste),
          energy: Math.round(energy),
          deals: completed
        });

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonthIdx = new Date().getMonth();
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
          const idx = (currentMonthIdx - i + 12) % 12;
          const m = months[idx];
          last6Months.push({ month: m, co2: monthly[m] || 0 });
        }

        setChartData(completed > 0 ? last6Months : []);
      } catch (error) {
        console.error("Error loading impact data:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const cards = [
    { icon: Globe, label: "Net Carbon Offset", value: `${totals.co2.toLocaleString()} kg`, sub: "Verified CO₂-e Reduction", color: "text-primary" },
    { icon: Trash, label: "Resource Recovery", value: `${totals.waste.toLocaleString()} kg`, sub: "Landfill Diversion Metric", color: "text-slate-600" },
    { icon: ZapIcon, label: "Energy Conservation", value: `${Math.round(totals.energy).toLocaleString()} kWh`, sub: "Industrial Eq. Savings", color: "text-primary" },
    { icon: ShieldCheck, label: "Circular Compliance", value: totals.deals, sub: "Verified Deal Closures", color: "text-slate-600" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 md:p-14 text-white">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary border border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6">
            <Leaf className="h-3.5 w-3.5" /> ESG Performance Report
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Sustainability Environmental Impact</h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed">
            Quantifying your factory's contribution to global carbon neutrality through verified industrial circularity.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full translate-x-32 -translate-y-32 blur-[100px]" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Processing ESG Metrics...</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((c, i) => (
              <Card key={i} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] group hover:shadow-[0_15px_40px_rgb(0,0,0,0.08)] transition-all">
                <CardContent className="p-8">
                  <div className={`h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-primary/5 transition-colors ${c.color}`}>
                    <c.icon className="h-6 w-6" />
                  </div>
                  <p className="text-3xl font-bold text-slate-900 tracking-tighter">{c.value}</p>
                  <p className="text-sm font-bold text-slate-800 mt-2">{c.label}</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">{c.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" /> CO₂ Mitigation Trend
                  </CardTitle>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">6-Month Operational Analysis</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-primary font-bold text-xs bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                  <TrendingUp className="h-3.5 w-3.5" /> +12.4% vs Last Quarter
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-10">
                {totals.deals > 0 ? (
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(153,60%,37%)" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="hsl(153,60%,37%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                          itemStyle={{ fontSize: '11px', fontWeight: 800 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="co2"
                          stroke="hsl(153,60%,37%)"
                          strokeWidth={4}
                          fill="url(#impactGrad)"
                          animationDuration={2000}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/30">
                    <Leaf className="h-12 w-12 mx-auto text-slate-200 mb-6" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Insufficient ESG Data</h3>
                    <p className="text-slate-500 max-w-sm mx-auto mb-8 text-sm font-medium">
                      Complete your first industrial exchange to activate real-time carbon mitigation visualization.
                    </p>
                    <Button variant="outline" className="rounded-xl border-slate-200 bg-white" onClick={() => window.location.href = '/dashboard/listings'}>Initialize Listing</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] bg-primary text-white overflow-hidden relative">
              <CardContent className="p-10 flex flex-col h-full relative z-10">
                <div className="h-16 w-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Circular Leaderboard</h3>
                <p className="text-white/70 font-medium mb-10 leading-relaxed text-sm">
                  Your current impact score places you in the <span className="text-white font-bold">Top 15%</span> of industrial recyclers in your region.
                </p>

                <div className="space-y-6 flex-1">
                  <div className="bg-white/10 backdrop-blur px-6 py-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Global Ranking</p>
                    <p className="text-xl font-bold">#412 Industrial Hub</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur px-6 py-4 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Impact Tier</p>
                    <p className="text-xl font-bold">Platinum Partner</p>
                  </div>
                </div>

                <Button className="mt-10 bg-white text-primary hover:bg-slate-50 font-bold h-14 rounded-2xl border-none">
                  Share ESG Report
                </Button>
              </CardContent>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-[60px]" />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Impact;
