import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Zap, Handshake, TrendingUp, ArrowRight, Factory, Recycle } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: Recycle, title: "Smart Waste Listings", desc: "List your industrial waste and find buyers automatically." },
  { icon: Zap, title: "AI-Powered Matching", desc: "Our engine matches waste generators with consumers using material, proximity, and quantity compatibility." },
  { icon: Handshake, title: "Deal Flow Management", desc: "Track deals from pending to completed with full lifecycle visibility." },
  { icon: Leaf, title: "Environmental Impact", desc: "Measure CO₂ saved, waste diverted, and energy conserved per deal." },
  { icon: TrendingUp, title: "Waste Forecasting", desc: "Predict future waste and pre-match buyers before waste is generated." },
  { icon: Factory, title: "Compliance Docs", desc: "Auto-generate waste transfer manifests and compliance reports." },
];

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <img src={logo} alt="punarCYCLE" className="h-10" />
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild><Link to="/dashboard">Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            ) : (
              <>
                <Button variant="ghost" asChild><Link to="/login">Sign In</Link></Button>
                <Button asChild><Link to="/register">Get Started</Link></Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="gradient-hero pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-6">
            <Leaf className="h-4 w-4" /> AI-Powered Circular Economy
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-gradient mb-6 max-w-4xl mx-auto leading-tight">
            Turn Industrial Waste Into Valuable Resources
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            punarCYCLE intelligently matches waste generators with consumers, creating a zero-waste industrial ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-base px-8">
              <Link to="/register">Start Trading Waste <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base px-8">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold text-center mb-4">How punarCYCLE Works</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            From listing waste to closing deals — our AI handles the heavy lifting.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all group">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-display font-bold text-primary-foreground mb-4">
            Ready to close the loop?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            Join the B2B circular economy marketplace. Register your factory today.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-base px-8">
            <Link to="/register">Register Now <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 punarCYCLE — Reuse · Trade · Sustain
        </div>
      </footer>
    </div>
  );
};

export default Landing;
