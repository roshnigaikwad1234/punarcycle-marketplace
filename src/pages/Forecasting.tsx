import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
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
      // Waste is typically ~15-25% of production output
      const wasteRatio = 0.18 + Math.random() * 0.07;
      const waste = Math.round(base * (1 + growth) ** i * wasteRatio);
      data.push({ month: months[mIdx], waste });
    }
    setForecast(data);
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
      latitude: profile?.latitude || 28.6,
      longitude: profile?.longitude || 77.2,
      hazardous: false,
      availabilityStart: new Date().toISOString().split("T")[0],
      availabilityEnd: new Date(Date.now() + 180 * 86400000).toISOString().split("T")[0],
      createdAt: serverTimestamp(),
      isForecast: true,
    });
    toast({ title: "Forecast listing created!", description: "Buyers will be pre-matched for your future waste." });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-accent" /> Waste Forecasting
          <span className="ml-2 text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">Advanced</span>
        </h1>
        <p className="text-muted-foreground">Predict future waste and pre-match buyers — zero-lag circular economy.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> Forecast Generator</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Waste Type</Label>
              <Select value={form.wasteType} onValueChange={(v) => setForm((p) => ({ ...p, wasteType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{WASTE_TYPES.map((t) => <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Monthly Production (kg)</Label>
              <Input type="number" value={form.monthlyProduction} onChange={(e) => setForm((p) => ({ ...p, monthlyProduction: e.target.value }))} placeholder="10000" />
            </div>
            <div className="space-y-2">
              <Label>Growth Rate (%)</Label>
              <Input type="number" value={form.growthRate} onChange={(e) => setForm((p) => ({ ...p, growthRate: e.target.value }))} />
            </div>
          </div>
          <Button onClick={generateForecast} disabled={!form.wasteType || !form.monthlyProduction}>
            Generate 6-Month Forecast
          </Button>
        </CardContent>
      </Card>

      {forecast && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projected Waste Output (Next 6 Months)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={forecast}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="waste" fill="hsl(145,63%,42%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="font-semibold">Total Projected: {forecast.reduce((a, b) => a + b.waste, 0).toLocaleString()} kg</p>
                <p className="text-sm text-muted-foreground">Pre-list this waste to find buyers early</p>
              </div>
              <Button onClick={preList}>
                Pre-List for Matching <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Forecasting;
