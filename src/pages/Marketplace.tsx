import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Users,
  MapPin,
  Package,
  IndianRupee,
  Building2,
  Factory,
  Shirt,
  FlaskConical,
  Cpu,
  Layers,
  Beaker,
} from "lucide-react";
import {
  MOCK_PRODUCERS,
  MOCK_CONSUMERS,
  type MockCompany,
  type IndustryType,
} from "@/data/mockCompanies";
import type { LucideIcon } from "lucide-react";

/* =========================
   INDUSTRY ICON MAPPING
========================= */
const INDUSTRY_ICONS: Record<IndustryType, LucideIcon> = {
  Steel: Factory,
  Textile: Shirt,
  Electronics: Cpu,
  Cement: Layers,
  Chemical: Beaker,
  Other: Building2,
};

type Tab = "producers" | "consumers";

const Marketplace = () => {
  const [tab, setTab] = useState<Tab>("producers");

  const list: MockCompany[] =
    tab === "producers" ? MOCK_PRODUCERS : MOCK_CONSUMERS;

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Marketplace
        </h1>
        <p className="text-slate-500 mt-1">
          Browse industrial waste producers and consumers by material type
        </p>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex rounded-xl bg-slate-100 p-1 w-fit">
        <button
          onClick={() => setTab("producers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === "producers"
              ? "bg-white text-slate-900 shadow"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Store className="h-4 w-4" />
          Producers
        </button>

        <button
          onClick={() => setTab("consumers")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === "consumers"
              ? "bg-white text-slate-900 shadow"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Users className="h-4 w-4" />
          Consumers
        </button>
      </div>

      {/* ================= CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((company) => {
          const Icon =
            INDUSTRY_ICONS[company.industryType] || Building2;

          return (
            <Card
              key={company.id}
              className="border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-7 w-7" />
                  </div>
                  <Badge
                    variant={
                      company.role === "consumer"
                        ? "secondary"
                        : "default"
                    }
                    className="capitalize"
                  >
                    {company.role}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-800 truncate">
                  {company.companyName}
                </h3>

                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Icon className="h-3 w-3" />
                  {company.industryType}
                </p>

                <div className="flex items-center gap-2 text-slate-500 text-sm mt-2">
                  <MapPin className="h-4 w-4" />
                  {company.city}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-slate-400" />
                    <span className="capitalize text-slate-700">
                      {company.materialType}
                    </span>
                    <span className="text-slate-400">
                      · {company.quantity} kg
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <IndianRupee className="h-4 w-4" />
                    {company.pricePerKg}/kg
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