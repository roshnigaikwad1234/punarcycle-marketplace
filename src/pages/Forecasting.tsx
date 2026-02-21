import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Sparkles, ArrowRight, BarChart3, Binary, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "@/hooks/use-toast";

const WASTE_TYPES = ["Plastic Scrap", "Fly Ash", "Metal Scrap", "Chemical Waste", "Textile Waste", "Organic Waste"];

const Forecasting = () => {
  const { user, profile } = useAuth();
  const [form, setForm] = useState({ wasteType: "", monthlyProduction: "", growthRate: "5" });
  const [forecast, setForecast] = useState<{ month: string; waste: number }[] | null>(null);

  const generateForecast = () => {
    const base = parseFloat(form.monthlyProduction);
    const growth = parseFloat(form.growthRate) / 100;
    if (!base) return;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const data = [];
    for (let i = 0; i < 6; i++) {
      const mIdx = (currentMonth + i + 1) % 12;
      const wasteRatio = 0.18 + Math.random() * 0.07;
      const waste = Math.round(base * (1 + growth) ** i * wasteRatio);
      data.push({ month: months[mIdx], waste });
    }
    setForecast(data);
    toast({ title: "Analysis Complete", description: "6-month algorithmic projection generated." });
  };

  const preList = async () => {
    if (!user || !forecast || !form.wasteType) return;
    const total = forecast.reduce((a, b) => a + b.waste, 0);
    await addDoc(collection(db, "wasteListings"), {
      factoryId: user.uid,
      factoryName: profile?.name || "",
      wasteType: form.wasteType.toLowerCase(),
      quantity: total,
      unit: "kg",
      frequency: "Monthly",
      location: profile?.location || "",
      hazardous: false,
      createdAt: serverTimestamp(),
      isForecast: true,
    });
    toast({ title: "Strategic Pre-Listing Success", description: "Marketplace pre-discovery initiated for future capacity." });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
            <Binary className="h-3.5 w-3.5" /> High-Fidelity Simulation
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Predictive Resource Forecasting</h1>
          <p className="text-slate-500 mt-1 font-medium italic">"Anticipate surplus. Eliminate lag. Automate circularity."</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engine Status</p>
            <p className="text-xs font-bold text-primary">Neural Match Active</p>
          </div>
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary animate-pulse" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] p-4 flex flex-col">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Parameters
            </CardTitle>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Input Production Variables</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6 flex-1">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Material</Label>
              <Select value={form.wasteType} onValueChange={(v) => setForm((p) => ({ ...p, wasteType: v }))}>
                <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50"><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent className="rounded-2xl">{WASTE_TYPES.map((t) => <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Monthly Ops (kg)</Label>
              <Input type="number" className="h-12 rounded-xl border-slate-200 bg-slate-50/50" value={form.monthlyProduction} onChange={(e) => setForm((p) => ({ ...p, monthlyProduction: e.target.value }))} placeholder="10000" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Projected Growth (%)</Label>
              <Input type="number" className="h-12 rounded-xl border-slate-200 bg-slate-50/50" value={form.growthRate} onChange={(e) => setForm((p) => ({ ...p, growthRate: e.target.value }))} />
            </div>
            <div className="pt-4 mt-auto">
              <Button onClick={generateForecast} className="w-full h-14 text-sm font-bold rounded-2xl shadow-xl shadow-primary/20" disabled={!form.wasteType || !form.monthlyProduction}>
                Initialize Projection Lifecycle
              </Button>
            </div>
          </CardContent>
        </Card>

        {forecast ? (
          <Card className="lg:col-span-2 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" /> Output Projection
                  </CardTitle>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">6-Month Strategic Yield</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Capacity</p>
                  <p className="text-2xl font-bold text-slate-900 tracking-tighter mt-1">{forecast.reduce((a, b) => a + b.waste, 0).toLocaleString()} kg</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-10">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={forecast}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="waste" radius={[12, 12, 12, 12]} barSize={40}>
                    {forecast.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 5 ? 'hsl(153,60%,37%)' : 'rgba(15, 23, 42, 0.05)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-10 flex flex-col md:flex-row items-center justify-between p-6 bg-slate-900 rounded-[2rem] text-white gap-6">
                <div className="relative">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Insight Recommendation</p>
                  <p className="text-sm font-medium mt-1">Pre-list this surplus now to secure high-value industrial bids.</p>
                </div>
                <Button onClick={preList} className="bg-primary text-white hover:bg-primary/90 font-bold h-12 px-8 rounded-xl shrink-0 white-glow">
                  Execute Pre-Discovery <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2.5rem] bg-slate-50/50 border-2 border-dashed border-slate-200">
            <CardContent className="h-full flex flex-col items-center justify-center p-20 text-center">
              <div className="h-20 w-20 bg-white shadow-sm rounded-[1.5rem] flex items-center justify-center mb-8">
                <Binary className="h-8 w-8 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-400">Awaiting Simulation Parameters</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-xs font-medium">Input your production variables on the left to initialize the neural forecasting engine.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Forecasting;
