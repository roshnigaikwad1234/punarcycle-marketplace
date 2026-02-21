import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Handshake, Clock, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
interface Deal {
    id: string;
    wasteListingId?: string;
    buyerFactoryId?: string | null;
    sellerFactoryId?: string;
    partnerCompanyName?: string;
    status: "pending" | "processing" | "shipping" | "completed" | "cancelled";
    createdAt: any;
    pricePerKg: number;
    quantity: number;
    wasteType: string;
    co2Saved: number;
}

const Deals = () => {
    const { user } = useAuth();
    const [deals, setDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("active");

    useEffect(() => {
        const fetchDeals = async () => {
            if (!user) return;
            try {
                const q = query(collection(db, "deals"));
                const snapshot = await getDocs(q);
                const allDeals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Deal[];

                // Filter: user is either buyer or seller (initiator)
                setDeals(allDeals.filter(d => d.buyerFactoryId === user.uid || d.sellerFactoryId === user.uid));
            } catch (error) {
                console.error("Error fetching deals:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDeals();
    }, [user]);

    const filteredDeals = deals.filter(d =>
        activeTab === "completed" ? d.status === "completed" : d.status !== "completed"
    );

    const getStatusIcon = (status: Deal["status"]) => {
        switch (status) {
            case "pending": return Clock;
            case "processing": return ShieldCheck;
            case "shipping": return Truck;
            case "completed": return CheckCircle2;
            default: return Clock;
        }
    };

    const getStatusColor = (status: Deal["status"]) => {
        switch (status) {
            case "pending": return "bg-amber-50 text-amber-600 border-amber-100";
            case "processing": return "bg-blue-50 text-blue-600 border-blue-100";
            case "shipping": return "bg-indigo-50 text-indigo-600 border-indigo-100";
            case "completed": return "bg-emerald-50 text-emerald-600 border-emerald-100";
            default: return "bg-slate-50 text-slate-600 border-slate-100";
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Trade Pipeline</h1>
                    <p className="text-slate-500 mt-1">Lifecycle management for active circular material exchanges</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                    <TabsList className="bg-slate-100 p-1 rounded-xl h-11 border border-slate-200">
                        <TabsTrigger value="active" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">Active Deals</TabsTrigger>
                        <TabsTrigger value="completed" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">History</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 rounded-3xl bg-slate-50 animate-pulse border border-slate-100" />
                    ))}
                </div>
            ) : filteredDeals.length === 0 ? (
                <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-20 text-center rounded-[2rem]">
                    <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Handshake className="h-10 w-10 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">No transactions in this category</h3>
                    <p className="text-slate-400 mt-2">Active deals will appear here once you initiate a transaction from the Matches page.</p>
                </Card>
            ) : (
                <div className="space-y-6">
                    {filteredDeals.map((deal) => {
                        const Icon = getStatusIcon(deal.status);
                        return (
                            <Card key={deal.id} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden rounded-3xl group hover:shadow-[0_15px_40px_rgb(0,0,0,0.06)] transition-all">
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                                        <div className="p-8 flex-1">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border ${getStatusColor(deal.status)}`}>
                                                    <Icon className="h-3.5 w-3.5" /> {deal.status}
                                                </div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID: {deal.id.slice(0, 8)}</span>
                                            </div>

                                            <h3 className="text-2xl font-black text-slate-900 mb-2 truncate capitalize">{deal.wasteType}</h3>
                                            {deal.partnerCompanyName && (
                                                <p className="text-sm text-slate-600 mb-2">
                                                    Request sent to <span className="font-semibold text-slate-900">{deal.partnerCompanyName}</span>
                                                </p>
                                            )}
                                            <div className="flex flex-wrap items-center gap-6 text-sm">
                                                <div className="flex items-center gap-2 text-slate-500 font-medium">
                                                    <span className="h-2 w-2 rounded-full bg-slate-300" /> Quantity: <span className="text-slate-900 font-bold">{deal.quantity}kg</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500 font-medium">
                                                    <span className="h-2 w-2 rounded-full bg-slate-300" /> Contract Value: <span className="text-slate-900 font-bold">₹{((deal.pricePerKg || 0) * (deal.quantity || 0)).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 lg:w-96 bg-slate-50/50 flex flex-col justify-center gap-4">
                                            {deal.partnerCompanyName && (
                                                <div className="space-y-1">
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Status</p>
                                                    <p className="text-sm font-medium text-slate-700">Request sent to <span className="font-semibold text-slate-900">{deal.partnerCompanyName}</span></p>
                                                    <p className="text-xs text-slate-500 mt-1">They can approve from their side. You’ll see updates here.</p>
                                                </div>
                                            )}
                                            {!deal.partnerCompanyName && deal.status === "pending" && (
                                                <p className="text-sm text-slate-600">Awaiting partner response.</p>
                                            )}
                                            {deal.status !== "pending" && deal.status !== "completed" && (
                                                <p className="text-sm text-slate-600 capitalize">{deal.status}</p>
                                            )}
                                            {deal.status === "completed" && (
                                                <p className="text-sm font-medium text-emerald-600">Deal completed</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Deals;
