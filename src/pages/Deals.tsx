import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Handshake, CheckCircle, Clock, FileText, ArrowUpRight, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface Deal {
  id: string;
  wasteListingId: string;
  buyerFactoryId: string;
  sellerFactoryId: string;
  wasteType: string;
  status: "pending" | "accepted" | "completed";
  co2Saved: number;
  distanceKm: number;
  compatibilityScore: number;
  createdAt?: any;
}

const statusConfig = {
  pending: { label: "Pipeline", variant: "secondary" as const, color: "bg-slate-100 text-slate-600" },
  accepted: { label: "In Progress", variant: "outline" as const, color: "border-primary text-primary" },
  completed: { label: "Finalized", variant: "default" as const, color: "bg-primary text-white" },
};

const Deals = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const snap = await getDocs(collection(db, "deals"));
    const all = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Deal))
      .filter((d) => d.buyerFactoryId === user.uid || d.sellerFactoryId === user.uid);
    setDeals(all.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const updateStatus = async (id: string, status: "accepted" | "completed") => {
    await updateDoc(doc(db, "deals", id), { status });
    toast({ title: `Transaction Updated`, description: `Asset status shifted to ${status}.` });
    load();
  };

  const generatePDF = (deal: Deal) => {
    const pdf = new jsPDF();
    pdf.setFontSize(22);
    pdf.setTextColor(15, 23, 42); // Slate 900
    pdf.text("punarCYCLE", 20, 30);
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text("INDUSTRIAL RESOURCE TRANSFER MANIFEST", 20, 38);

    pdf.setDrawColor(230);
    pdf.line(20, 45, 190, 45);

    pdf.setFontSize(11);
    pdf.setTextColor(50);
    pdf.text(`Manifest ID:`, 20, 60);
    pdf.text(deal.id.toUpperCase(), 60, 60);

    pdf.text(`Resource Category:`, 20, 70);
    pdf.text(deal.wasteType.toUpperCase(), 60, 70);

    pdf.text(`Transaction Status:`, 20, 80);
    pdf.text(deal.status.toUpperCase(), 60, 80);

    pdf.text(`Environmental Offset:`, 20, 90);
    pdf.text(`${deal.co2Saved} kg CO2-e`, 60, 90);

    pdf.setFontSize(9);
    pdf.setTextColor(150);
    pdf.text("This manifest is a digital record of circular resource transfer authorized via punarCYCLE AI.", 20, 120);
    pdf.text(`Generated on ${new Date().toLocaleString()}`, 20, 125);

    pdf.save(`punarCYCLE_MANIFEST_${deal.id.slice(0, 8)}.pdf`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Transaction Flow</h1>
          <p className="text-slate-500 mt-1 uppercase text-[10px] font-black tracking-widest">Post-Match Negotiation Hub</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 shadow-sm">
          Active Pipeline Value: <span className="text-primary">High</span>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Ledger...</p>
        </div>
      ) : deals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/40">
          <div className="h-24 w-24 rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center mb-10">
            <Handshake className="h-10 w-10 text-primary/40" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No Active Deals</h3>
          <p className="text-slate-500 max-w-sm text-center font-medium leading-relaxed mb-10">
            Your transaction ledger is empty. Visit the Match Hub to initialize strategic partnerships.
          </p>
          <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 bg-white" onClick={() => window.location.href = '/dashboard/matches'}>
            Find Partners
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {deals.map((d) => {
            const cfg = statusConfig[d.status];
            return (
              <Card key={d.id} className="overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgb(0,0,0,0.06)] transition-all bg-white rounded-[2rem] group">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row min-h-[140px]">
                    <div className="flex-1 p-8 flex flex-col md:flex-row md:items-center gap-8">
                      <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 border border-slate-100 group-hover:bg-primary/5 transition-colors">
                        <Handshake className="h-8 w-8 text-primary/60 group-hover:text-primary transition-colors" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900 capitalize tracking-tight">{d.wasteType}</h3>
                          <Badge className={`${cfg.color} border-none rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-widest`}>
                            {cfg.label}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-1.5"><ArrowUpRight className="h-3.5 w-3.5 text-primary" /> Match: {d.compatibilityScore}%</span>
                          <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> ID: {d.id.slice(0, 8)}...</span>
                          <span className="flex items-center gap-1.5 text-success"><TrendingUp className="h-3.5 w-3.5" /> {d.co2Saved}kg Offset</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 px-8 py-6 md:w-80 flex items-center justify-center gap-3 border-t md:border-t-0 md:border-l border-slate-100">
                      {d.status === "pending" && (
                        <Button className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/15" onClick={() => updateStatus(d.id, "accepted")}>Accept B2B Bid</Button>
                      )}
                      {d.status === "accepted" && (
                        <Button className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/15" onClick={() => updateStatus(d.id, "completed")}>Close Transaction</Button>
                      )}
                      <Button variant="outline" className="h-12 w-12 rounded-xl border-slate-200 bg-white p-0 hover:bg-slate-50 transition-colors" onClick={() => generatePDF(d)}>
                        <FileText className="h-5 w-5 text-slate-400 group-hover:text-slate-900" />
                      </Button>
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
