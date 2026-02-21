import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Droplets, Zap as ZapIcon, Trash } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const Impact = () => {
  const { user } = useAuth();
  const [totals, setTotals] = useState({ co2: 0, waste: 0, energy: 0, deals: 0 });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const snap = await getDocs(collection(db, "deals"));
      let co2 = 0, waste = 0, energy = 0, completed = 0;
      const monthly: Record<string, number> = {};

      snap.docs.forEach((d) => {
        const data = d.data();
        if ((data.buyerFactoryId === user.uid || data.sellerFactoryId === user.uid) && data.status === "completed") {
          const saved = data.co2Saved || 0;
          co2 += saved;
          waste += saved * 2;
          energy += saved * 0.6;
          completed++;
          const month = data.createdAt?.toDate?.()
            ? data.createdAt.toDate().toLocaleString("default", { month: "short" })
            : "Jan";
          monthly[month] = (monthly[month] || 0) + saved;
        }
      });

      setTotals({ co2: Math.round(co2), waste: Math.round(waste), energy: Math.round(energy), deals: completed });
      setChartData(Object.entries(monthly).map(([month, value]) => ({ month, co2: value })));
    };
    load();
  }, [user]);

  const cards = [
    { icon: Leaf, label: "CO₂ Saved", value: `${totals.co2} kg`, color: "text-success" },
    { icon: Trash, label: "Waste Diverted", value: `${totals.waste} kg`, color: "text-primary" },
    { icon: ZapIcon, label: "Energy Saved", value: `${totals.energy} kWh`, color: "text-accent" },
    { icon: Droplets, label: "Completed Deals", value: totals.deals, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Leaf className="h-6 w-6 text-success" /> Environmental Impact
        </h1>
        <p className="text-muted-foreground">Track your contribution to the circular economy.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <c.icon className={`h-8 w-8 ${c.color} mb-2`} />
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">CO₂ Savings Over Time</CardTitle></CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(145,63%,42%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(145,63%,42%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="co2" stroke="hsl(145,63%,42%)" fill="url(#co2Grad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm py-12 text-center">Complete deals to see your environmental impact!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Impact;
