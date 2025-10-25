import { Shield, Settings, CheckCircle, Award, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-shield.png";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
                Take Back Control of Your Internet
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl">
                WequiGuard is a free, intelligent DNS filter that automatically blocks inappropriate content like pornography, gambling, and malicious websites across your entire home network.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/setup">
                  <Button size="lg" variant="secondary" className="text-lg shadow-large hover:shadow-medium transition-all">
                    Get Started for Free
                  </Button>
                </Link>
                <Link to="/features">
                  <Button size="lg" variant="outline" className="text-lg bg-white/10 text-white border-white/30 hover:bg-white/20">
                    Learn More →
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <img 
                src={heroImage} 
                alt="Digital protection shield with devices" 
                className="w-full h-auto drop-shadow-2xl animate-in fade-in zoom-in duration-1000"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-secondary-light">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-secondary" />
              <span className="text-sm font-medium text-foreground">Featured in TechFamily Magazine</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-secondary" />
              <span className="text-sm font-medium text-foreground">Trusted by Families Worldwide</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-secondary" />
              <span className="text-sm font-medium text-foreground">Parenting Choice Award 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-feature">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Online Safety in 3 Simple Steps</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get protected in just minutes with our easy setup process
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="p-8 text-center space-y-4 shadow-soft hover:shadow-medium transition-shadow">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Choose Your Protection Level</h3>
              <p className="text-muted-foreground">
                Select from our pre-configured security filters tailored to your family's needs.
              </p>
            </Card>
            
            <Card className="p-8 text-center space-y-4 shadow-soft hover:shadow-medium transition-shadow">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
                <Settings className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Change Your DNS Settings</h3>
              <p className="text-muted-foreground">
                Follow our simple guide for your router or device. It takes just 5 minutes.
              </p>
            </Card>
            
            <Card className="p-8 text-center space-y-4 shadow-soft hover:shadow-medium transition-shadow">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Browse with Peace of Mind</h3>
              <p className="text-muted-foreground">
                Your protection is active. No software to install, no slowdowns.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Create a Safer Internet for Your Family?
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Join thousands of families protecting their digital lives with WequiGuard
          </p>
          <Link to="/setup">
            <Button size="lg" variant="secondary" className="text-lg shadow-large">
              Set Up WequiGuard Now
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
