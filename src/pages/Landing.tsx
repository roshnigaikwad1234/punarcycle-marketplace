import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  Zap,
  ArrowRight,
  Recycle,
} from "lucide-react";
import logo from "@/assets/logo.png";
import logoTransparent from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    icon: Recycle,
    title: "List Industrial Waste",
    desc: "Easily list your factory's waste streams with detailed specifications and quantities.",
  },
  {
    icon: Zap,
    title: "AI-Powered Matching",
    desc: "Our system intelligently matches waste with the most suitable buyers based on compatibility.",
  },
  {
    icon: Leaf,
    title: "Environmental Impact",
    desc: "Track CO₂ reduced, waste diverted, and environmental savings for every deal.",
  },
];

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <img
            src={logo}
            alt="punarCYCLE"
            style={{ height: '120px', width: 'auto', display: 'block', objectFit: 'contain' }}
            className="md:h-40"
          />

          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">
                  Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="pt-32 pb-24 text-center relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-6">
            <Leaf className="h-4 w-4" /> Reuse • Trade • Sustain
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Turn Industrial Waste Into{" "}
            <span className="text-primary">Valuable Resources</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-10">
            punarCYCLE connects waste-generating factories with businesses
            that can reuse those materials — creating a smarter circular
            economy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">
                Register Factory <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/matches">View AI Matches</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            How punarCYCLE Works
          </h2>

          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            From listing waste to closing deals — our system handles the
            matching intelligently.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl p-8 text-center"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-20 bg-muted text-center">
        <img
          src={logoTransparent}
          alt="punarCYCLE"
          style={{ height: '250px', width: 'auto', display: 'block', margin: '0 auto 24px' }}
          className="object-contain"
        />

        <h2 className="text-3xl font-bold mb-4">
          Ready to close the loop?
        </h2>

        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          Join India’s industrial circular economy marketplace and
          start turning waste into value.
        </p>

        <Button size="lg" asChild>
          <Link to="/register">
            Register Now <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-card border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2026 punarCYCLE — Reuse · Trade · Sustain
      </footer>
    </div>
  );
};

export default Landing;