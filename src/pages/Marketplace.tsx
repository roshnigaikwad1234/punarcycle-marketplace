import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, MapPin, Package, IndianRupee, Users, Layers, Building2 } from "lucide-react";
import { MOCK_PRODUCERS, MOCK_CONSUMERS, type MockCompany, type IndustryType } from "@/data/mockCompanies";
import type { LucideIcon } from "lucide-react";
import { Factory, Shirt, FlaskConical, Cpu, Beaker } from "lucide-react";

const INDUSTRY_ICONS: Record<IndustryType, LucideIcon> = {
  Steel: Factory,
  Textile: Shirt,
  Pharma: FlaskConical,
  Electronics: Cpu,
  Cement: Layers,
  Chemical: Beaker,
  Other: Building2,
};

type Tab = "consumers" | "producers";

const Marketplace = () => {
  const [tab, setTab] = useState<Tab>("producers");

  const producers = MOCK_PRODUCERS;
  const consumers = MOCK_CONSUMERS;
  const list = tab === "producers" ? producers : consumers;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Marketplace</h1>
          <p className="text-slate-500 mt-1">Browse producers and consumers — 10 companies in each category</p>
        </div>
      </div>

      <div className="flex rounded-xl bg-slate-100 p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab("producers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === "producers" ? "bg-white text-slate-900 shadow" : "text-slate-600 hover:text-slate-900"}`}
        >
          <Store className="h-4 w-4" /> Producers
        </button>
        <button
          type="button"
          onClick={() => setTab("consumers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === "consumers" ? "bg-white text-slate-900 shadow" : "text-slate-600 hover:text-slate-900"}`}
        >
          <Users className="h-4 w-4" /> Consumers
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((c: MockCompany) => {
          const Icon = INDUSTRY_ICONS[c.industryType] || Building2;
          return (
            <Card key={c.id} className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="h-7 w-7" />
                  </div>
                  <Badge variant={c.role === "consumer" ? "secondary" : "default"} className="capitalize">
                    {c.role}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-slate-800 truncate">{c.companyName}</h3>
                <p className="text-xs text-slate-500 mt-0.5 capitalize flex items-center gap-1">
                  <Icon className="h-3 w-3" /> {c.industryType}
                </p>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-2">
                  <MapPin className="h-3.5 w-3.5" /> {c.city}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 capitalize">{c.materialType}</span>
                    <span className="text-slate-400">· {c.quantity} kg</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <IndianRupee className="h-4 w-4" /> {c.pricePerKg}/kg
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Marketplace;
