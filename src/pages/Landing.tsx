import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Zap, ArrowRight, Recycle } from "lucide-react";
import heroVideo from "@/assets/v1.mp4";
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
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ================= NAVBAR (CLEAN) ================= */}
      <nav className="fixed top-0 w-full z-50 bg-transparent">
        <div className="container mx-auto px-4 py-6 flex justify-end">
          {!user && (
            <div className="flex gap-3">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* ================= HERO WITH VIDEO ================= */}
      <section className="relative pt-44 pb-36 text-center text-white">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/55"></div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 max-w-5xl">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Leaf className="h-4 w-4" /> Reuse • Trade • Sustain
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Turn Industrial Waste Into{" "}
            <span className="text-primary">Valuable Resources</span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10">
            punarCYCLE connects waste-generating factories with businesses
            that can reuse those materials — creating a smarter circular
            economy.
          </p>

          <div className="flex justify-center">
            <Button size="lg" asChild>
              <Link to="/register">
                Register Factory <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
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
          style={{ height: "220px", width: "auto", margin: "0 auto 24px" }}
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