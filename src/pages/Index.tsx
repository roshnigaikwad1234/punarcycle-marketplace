import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, ArrowRight } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: Leaf, title: "Smart Waste Listings", desc: "List your industrial waste and find buyers automatically." },
];

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Welcome to punarCYCLE</h1>
        <p className="text-xl text-muted-foreground">AI-powered B2B circular economy marketplace</p>
      </div>
    </div>
  );
};

export default Landing;
