import { ShieldBan, Search, ShieldCheck, Lock, Laptop, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Features = () => {
  const features = [
    {
      icon: ShieldBan,
      title: "Block Harmful Content",
      description: "Automatically block access to pornography, adult content, gambling sites, and violent or extremist material.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Search,
      title: "SafeSearch Enforcement",
      description: "We force SafeSearch on popular search engines like Google, Bing, and DuckDuckGo, providing an extra layer of protection.",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: ShieldCheck,
      title: "Malware & Phishing Protection",
      description: "Our DNS blocks known malicious websites, protecting your family from viruses, ransomware, and scams.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Lock,
      title: "No Tracking, Total Privacy",
      description: "We do not log your browsing history or sell your data. Your privacy is our priority.",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Laptop,
      title: "Works on All Devices",
      description: "Once set up on your router, it protects every device—phones, laptops, tablets, smart TVs, and gaming consoles.",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      icon: DollarSign,
      title: "Completely Free",
      description: "WequiGuard is a free service because we believe a safer internet should be accessible to everyone.",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="py-20 bg-gradient-feature">
          <div className="container">
            <div className="text-center mb-16 space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">Powerful Protection, Simple Setup</h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                WequiGuard works at the network level, filtering content on every device connected to your Wi-Fi.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card 
                    key={index} 
                    className="p-8 space-y-4 shadow-soft hover:shadow-medium transition-all hover:-translate-y-1"
                  >
                    <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-8 w-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Network-Level Protection That Just Works
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Unlike browser extensions or apps, WequiGuard protects at the DNS level. This means every device on your network is automatically protected without installing anything on each device.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Features;
