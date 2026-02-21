import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Leaf,
    BarChart3,
    TrendingUp,
    Droplets,
    Globe2,
    Award,
    ArrowUpRight,
    Download,
    Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    LineChart,
    Line
} from "recharts";

const Impact = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalCo2: 0,
        wasteDiverted: 0,
        dealsCompleted: 0,
        waterSaved: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchImpact = async () => {
            if (!user) return;
            try {
                const q = query(collection(db, "deals"), where("status", "==", "completed"));
                const snapshot = await getDocs(q);

                let co2 = 0;
                let waste = 0;
                let deals = 0;

                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.buyerFactoryId === user.uid || data.sellerFactoryId === user.uid) {
                        co2 += data.co2Saved || 0;
                        waste += data.quantity || 0;
                        deals++;
                    }
                });

                setStats({
                    totalCo2: co2,
                    wasteDiverted: waste,
                    dealsCompleted: deals,
                    waterSaved: Math.round(waste * 0.8) // Estimated 0.8L per kg
                });
            } catch (error) {
                console.error("Error fetching impact:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchImpact();
    }, [user]);

    const chartData = [
        { month: "Jan", co2: 120, waste: 400 },
        { month: "Feb", co2: 210, waste: 750 },
        { month: "Mar", co2: 450, waste: 1200 },
        { month: "Apr", co2: 380, waste: 900 },
        { month: "May", co2: 600, waste: 1500 },
        { month: "Jun", co2: 850, waste: 2100 },
    ];

    const categoryData = [
        { name: "Plastic", value: 45, color: "hsl(153,60%,37%)" },
        { name: "Metal", value: 30, color: "hsl(215,25%,27%)" },
        { name: "Rubber", value: 15, color: "hsl(217,91%,60%)" },
        { name: "Other", value: 10, color: "hsl(38,92%,50%)" },
    ];

    const metrics = [
        { label: "Carbon Offset", value: `${stats.totalCo2} kg`, sub: "CO₂-e reduced", icon: Globe2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Waste Diverted", value: `${stats.wasteDiverted} kg`, sub: "Circular recycling", icon: BarChart3, color: "text-blue-600", bg: "bg-blue-50" },
        { label: "Water Conservation", value: `${stats.waterSaved} L`, sub: "Process avoidance", icon: Droplets, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Closed Loops", value: stats.dealsCompleted, sub: "Completed trades", icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ESG Performance</h1>
                    <p className="text-slate-500 mt-1">Real-time quantification of your industrial sustainability footprint</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl border-slate-200 font-bold text-xs uppercase tracking-widest gap-2">
                        <Download className="h-4 w-4" /> Export Report
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest gap-2">
                        <Share2 className="h-4 w-4" /> Share Progress
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <Card key={i} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
                        <CardContent className="p-6">
                            <div className={`${m.bg} ${m.color} h-12 w-12 rounded-2xl flex items-center justify-center mb-4`}>
                                <m.icon className="h-6 w-6" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{m.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 leading-none">{m.value}</h3>
                            <p className="text-xs font-medium text-slate-500 mt-2">{m.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden">
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black text-slate-900">Sustainability Growth</CardTitle>
                                <p className="text-sm text-slate-500">6-month trend analysis of impact metrics</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-xl flex gap-1">
                                <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase rounded-lg bg-white shadow-sm">CO₂</Button>
                                <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase rounded-lg text-slate-400">Waste</Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData}>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                                />
                                <Line type="monotone" dataKey="co2" stroke="hsl(153,60%,37%)" strokeWidth={4} dot={{ r: 6, fill: 'white', stroke: 'hsl(153,60%,37%)', strokeWidth: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] overflow-hidden flex flex-col">
                    <CardHeader className="p-8 pb-0">
                        <CardTitle className="text-xl font-black text-slate-900">Material Composition</CardTitle>
                        <p className="text-sm text-slate-500">Diverted waste by category</p>
                    </CardHeader>
                    <CardContent className="p-8 flex-1 flex flex-col justify-center">
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-3 mt-6">
                            {categoryData.map((c, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                                        <span className="text-sm font-bold text-slate-700">{c.name}</span>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{c.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-500/20 mb-6">
                            <Award className="h-4 w-4" /> Top 5% Global Achiever
                        </div>
                        <h2 className="text-4xl font-black leading-tight mb-4">You've saved enough CO₂ to power <span className="text-emerald-400">12 industrial plants</span> for a month.</h2>
                        <p className="text-slate-400 text-lg mb-8">Your contribution to the circular economy is setting a new benchmark for industrial sustainability in your region.</p>
                        <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl h-12 px-8 font-black uppercase tracking-widest">View Carbon Ledger <ArrowUpRight className="ml-2 h-5 w-5" /></Button>
                    </div>
                    <div className="hidden md:flex justify-end">
                        <div className="h-64 w-64 bg-emerald-500/10 rounded-full border border-emerald-500/20 flex items-center justify-center animate-pulse">
                            <div className="h-48 w-48 bg-emerald-500/20 rounded-full flex items-center justify-center">
                                <Leaf className="h-24 w-24 text-emerald-400" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full" />
            </div>
        </div>
    );
};

export default Impact;
