import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, getDocs } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Handshake,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Truck,
} from "lucide-react";

interface Deal {
  id: string;
  sellerFactoryId?: string;
  buyerFactoryId?: string | null;
  partnerCompanyName?: string;
  status: "pending" | "processing" | "shipping" | "completed" | "cancelled";
  createdAt?: any;
  pricePerKg: number;
  quantity: number;
  wasteType: string;
  co2Saved?: number;
}

const Deals = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    const fetchDeals = async () => {
      if (!user) return;

      try {
        const q = query(collection(db, "deals"));
        const snapshot = await getDocs(q);

        const allDeals = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Deal[];

        // ✅ show deals initiated by this user
        const myDeals = allDeals.filter(
          (d) =>
            d.sellerFactoryId === user.uid ||
            d.buyerFactoryId === user.uid
        );

        setDeals(myDeals);
      } catch (err) {
        console.error("Error fetching deals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [user]);

  const filteredDeals = deals.filter((d) =>
    activeTab === "completed"
      ? d.status === "completed"
      : d.status !== "completed"
  );

  const getStatusIcon = (status: Deal["status"]) => {
    switch (status) {
      case "pending":
        return Clock;
      case "processing":
        return ShieldCheck;
      case "shipping":
        return Truck;
      case "completed":
        return CheckCircle2;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status: Deal["status"]) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "processing":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "shipping":
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Trade Pipeline
          </h1>
          <p className="text-slate-500 mt-1">
            Lifecycle management for circular material exchanges
          </p>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full md:w-auto"
        >
          <TabsList className="bg-slate-100 p-1 rounded-xl h-11 border">
            <TabsTrigger
              value="active"
              className="rounded-lg px-6 font-bold text-xs uppercase"
            >
              Active Deals
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="rounded-lg px-6 font-bold text-xs uppercase"
            >
              History
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-3xl bg-slate-50 animate-pulse border"
            />
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredDeals.length === 0 && (
        <Card className="p-20 text-center rounded-[2rem]">
          <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Handshake className="h-10 w-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">
            No deals here yet
          </h3>
          <p className="text-slate-400 mt-2">
            Initiate a deal from AI Matches to see it here.
          </p>
        </Card>
      )}

      {/* DEAL LIST */}
      {!loading && filteredDeals.length > 0 && (
        <div className="space-y-6">
          {filteredDeals.map((deal) => {
            const Icon = getStatusIcon(deal.status);
            const value =
              (deal.pricePerKg || 0) * (deal.quantity || 0);

            return (
              <Card
                key={deal.id}
                className="rounded-3xl shadow hover:shadow-lg transition"
              >
                <CardContent className="p-8 flex flex-col lg:flex-row justify-between gap-6">
                  <div>
                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                        deal.status
                      )}`}
                    >
                      <Icon className="h-4 w-4" />
                      {deal.status}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mt-4 capitalize">
                      {deal.wasteType}
                    </h3>

                    {deal.partnerCompanyName && (
                      <p className="text-slate-600 mt-1">
                        Sent to{" "}
                        <span className="font-semibold">
                          {deal.partnerCompanyName}
                        </span>
                      </p>
                    )}

                    <p className="text-sm text-slate-500 mt-3">
                      Quantity:{" "}
                      <strong>{deal.quantity} kg</strong> · Value:{" "}
                      <strong>₹{value.toLocaleString()}</strong>
                    </p>
                  </div>

                  <div className="text-sm text-slate-500 flex items-center">
                    Status updates will appear here
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