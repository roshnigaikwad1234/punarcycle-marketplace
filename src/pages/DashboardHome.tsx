import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Zap, Handshake, Leaf, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(145,63%,42%)", "hsl(38,92%,50%)", "hsl(210,80%,55%)", "hsl(220,15%,50%)"];

const DashboardHome = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({ listings: 0, matches: 0, deals: 0, co2: 0 });
  const [dealData, setDealData] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const listSnap = await getDocs(query(collection(db, "wasteListings"), where("factoryId", "==", user.uid)));
      const dealSnap = await getDocs(query(collection(db, "deals"), where("buyerFactoryId", "==", user.uid)));
      const dealSnap2 = await getDocs(query(collection(db, "deals")));
      
      let totalCo2 = 0;
      const statusCount: Record<string, number> = { pending: 0, accepted: 0, completed: 0 };
      dealSnap2.forEach((d) => {
        const data = d.data();
        if (data.buyerFactoryId === user.uid || data.sellerFactoryId === user.uid) {
          statusCount[data.status] = (statusCount[data.status] || 0) + 1;
          if (data.status === "completed") totalCo2 += data.co2Saved || 0;
        }
      });

      setStats({
        listings: listSnap.size,
        matches: 0,
        deals: Object.values(statusCount).reduce((a, b) => a + b, 0),
        co2: totalCo2,
      });
      setDealData(Object.entries(statusCount).map(([name, value]) => ({ name, value })));
    };
    load();
  }, [user]);

  const cards = [
    { icon: Package, label: "My Listings", value: stats.listings, color: "text-primary" },
    { icon: Zap, label: "AI Matches", value: stats.matches, color: "text-accent" },
    { icon: Handshake, label: "Active Deals", value: stats.deals, color: "text-primary" },
    { icon: Leaf, label: "CO₂ Saved (kg)", value: stats.co2, color: "text-success" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Welcome back, {profile?.name || "Factory"}</h1>
        <p className="text-muted-foreground">Here's your circular economy overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <c.icon className={`h-5 w-5 ${c.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Deal Status Distribution</CardTitle></CardHeader>
          <CardContent>
            {dealData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={dealData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                    {dealData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm py-12 text-center">No deals yet. Start by creating waste listings!</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Create a new waste listing", link: "/dashboard/listings" },
              { label: "Check AI-matched buyers/sellers", link: "/dashboard/matches" },
              { label: "View environmental impact", link: "/dashboard/impact" },
              { label: "Forecast future waste", link: "/dashboard/forecasting" },
            ].map((a, i) => (
              <a key={i} href={a.link} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{a.label}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
