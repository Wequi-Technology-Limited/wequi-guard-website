import { useState } from "react";
import { Router, Laptop, Smartphone, TabletSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Setup = () => {
  const [selectedDevice, setSelectedDevice] = useState("router");

  const dnsServers = {
    primary: "45.90.28.0",
    secondary: "45.90.30.0",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20">
        <div className="container max-w-5xl">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Get Protected in 5 Minutes</h1>
            <p className="text-lg text-muted-foreground">
              Choose your device or router below for step-by-step instructions
            </p>
          </div>

          {/* DNS Servers Display */}
          <Card className="p-8 mb-12 bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/20">
            <h3 className="text-xl font-semibold mb-4 text-center">WequiGuard DNS Servers</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Primary DNS</p>
                <p className="text-3xl font-mono font-bold text-primary">{dnsServers.primary}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Secondary DNS</p>
                <p className="text-3xl font-mono font-bold text-secondary">{dnsServers.secondary}</p>
              </div>
            </div>
          </Card>

          {/* Device Selection */}
          <Tabs value={selectedDevice} onValueChange={setSelectedDevice} className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
              <TabsTrigger value="router" className="flex flex-col items-center gap-2 py-4">
                <Router className="h-6 w-6" />
                <span>Router</span>
                <span className="text-xs text-muted-foreground">(Recommended)</span>
              </TabsTrigger>
              <TabsTrigger value="windows" className="flex flex-col items-center gap-2 py-4">
                <Laptop className="h-6 w-6" />
                <span>Windows</span>
              </TabsTrigger>
              <TabsTrigger value="mac" className="flex flex-col items-center gap-2 py-4">
                <Laptop className="h-6 w-6" />
                <span>macOS</span>
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex flex-col items-center gap-2 py-4">
                <Smartphone className="h-6 w-6" />
                <span>Mobile</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="router" className="space-y-6">
              <Card className="p-8">
                <h3 className="text-2xl font-semibold mb-6">Setup on Your Router (Protects All Devices)</h3>
                <ol className="space-y-6 list-decimal list-inside text-foreground">
                  <li className="text-lg">
                    <span className="font-semibold">Access your router's admin panel</span>
                    <p className="mt-2 ml-6 text-muted-foreground">
                      Open a browser and type your router's IP address (usually 192.168.1.1 or 192.168.0.1). Log in with your admin credentials.
                    </p>
                  </li>
                  <li className="text-lg">
                    <span className="font-semibold">Find DNS settings</span>
                    <p className="mt-2 ml-6 text-muted-foreground">
                      Look for sections labeled "DNS", "Network", "Internet", or "WAN". This varies by router brand.
                    </p>
                  </li>
                  <li className="text-lg">
                    <span className="font-semibold">Enter WequiGuard DNS servers</span>
                    <p className="mt-2 ml-6 text-muted-foreground">
                      Replace existing DNS servers with:<br/>
                      Primary: <span className="font-mono font-semibold text-primary">{dnsServers.primary}</span><br/>
                      Secondary: <span className="font-mono font-semibold text-secondary">{dnsServers.secondary}</span>
                    </p>
                  </li>
                  <li className="text-lg">
                    <span className="font-semibold">Save and restart</span>
                    <p className="mt-2 ml-6 text-muted-foreground">
                      Save your settings and restart your router if prompted. All devices will now be protected!
                    </p>
                  </li>
                </ol>
              </Card>
            </TabsContent>

            <TabsContent value="windows" className="space-y-6">
              <Card className="p-8">
                <h3 className="text-2xl font-semibold mb-6">Setup on Windows</h3>
                <ol className="space-y-6 list-decimal list-inside text-foreground">
                  <li className="text-lg">
                    <span className="font-semibold">Open Network Settings</span>
                    <p className="mt-2 ml-6 text-muted-foreground">
                      Right-click the network icon in your system tray and select "Open Network & Internet settings"
                    </p>
                  </li>
                  <li className="text-lg">
                    <span className="font-semibold">Access adapter settings</span>
                    <p className="mt-2 ml-6 text-muted-foreground">
                      Click "Change adapter options", then right-click your active connection and select "Properties"
                    </p>
                  </li>
                  <li className="text-lg">
                    <span className="font-semibold">Configure DNS</span>
                    <p className="mt-2 ml-6 text-muted-foreground">
                      Select "Internet Protocol Version 4 (TCP/IPv4)" and click "Properties". Choose "Use the following DNS server addresses" and enter:<br/>
                      Preferred: <span className="font-mono font-semibold text-primary">{dnsServers.primary}</span><br/>
                      Alternate: <span className="font-mono font-semibold text-secondary">{dnsServers.secondary}</span>
                    </p>
                  </li>
                  <li className="text-lg">
                    <span className="font-semibold">Save and verify</span>
                    <p className="mt-2 ml-6 text-muted-foreground">
                      Click "OK" to save. Your Windows device is now protected!
                    </p>
                  </li>
                </ol>
              </Card>
            </TabsContent>

            <TabsContent value="mac" className="space-y-6">
              <Card className="p-8">
                <h3 className="text-2xl font-semibold mb-6">Setup on macOS</h3>
                <ol className="space-y-6 list-decimal list-inside text-foreground">
                  <li className="text-lg">
                    <span className="font-semibold">Open System Preferences</span>
                    <p className="mt-2 ml-6 text-muted-foreground">
                      Click the Apple menu and select "System Preferences" (or "System Settings" on newer macOS)
                    </p>
                  </li>
                  <li className="text-lg">
                    <span className="font-semibold">Go to Network settings</span>
                    <p className="mt-2 ml-6 text-muted-foreground">
                      Click "Network", select your active connection (Wi-Fi or Ethernet), and click "Advanced"
                    </p>
                  </li>
                  <li className="text-lg">
                    <span className="font-semibold">Configure DNS</span>
                    <p className="mt-2 ml-6 text-muted-foreground">
                      Click the "DNS" tab, click the "+" button to add DNS servers:<br/>
                      <span className="font-mono font-semibold text-primary">{dnsServers.primary}</span><br/>
                      <span className="font-mono font-semibold text-secondary">{dnsServers.secondary}</span>
                    </p>
                  </li>
                  <li className="text-lg">
                    <span className="font-semibold">Apply changes</span>
                    <p className="mt-2 ml-6 text-muted-foreground">
                      Click "OK", then "Apply". Your Mac is now protected!
                    </p>
                  </li>
                </ol>
              </Card>
            </TabsContent>

            <TabsContent value="mobile" className="space-y-6">
              <Card className="p-8">
                <h3 className="text-2xl font-semibold mb-6">Setup on Mobile Devices</h3>
                
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xl font-semibold mb-4 text-primary">iOS/iPhone</h4>
                    <ol className="space-y-4 list-decimal list-inside text-foreground">
                      <li>Go to Settings → Wi-Fi</li>
                      <li>Tap the (i) icon next to your connected network</li>
                      <li>Tap "Configure DNS" → "Manual"</li>
                      <li>Remove existing servers and add: <span className="font-mono text-primary">{dnsServers.primary}</span> and <span className="font-mono text-secondary">{dnsServers.secondary}</span></li>
                      <li>Tap "Save"</li>
                    </ol>
                  </div>

                  <div>
                    <h4 className="text-xl font-semibold mb-4 text-secondary">Android</h4>
                    <ol className="space-y-4 list-decimal list-inside text-foreground">
                      <li>Go to Settings → Network & Internet → Wi-Fi</li>
                      <li>Long-press your connected network and select "Modify network"</li>
                      <li>Expand "Advanced options" and change IP settings to "Static"</li>
                      <li>Enter DNS servers: <span className="font-mono text-primary">{dnsServers.primary}</span> and <span className="font-mono text-secondary">{dnsServers.secondary}</span></li>
                      <li>Tap "Save"</li>
                    </ol>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Troubleshooting */}
          <Card className="p-8 mt-12 bg-muted/30">
            <h3 className="text-2xl font-semibold mb-6">Having Trouble?</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Settings didn't save?</h4>
                <p className="text-muted-foreground">Make sure you clicked "Save" or "Apply" after entering the DNS addresses. Try restarting your device.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Internet is slow?</h4>
                <p className="text-muted-foreground">DNS changes typically don't affect speed. Try flushing your DNS cache or restarting your router.</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">How to check if it's working?</h4>
                <p className="text-muted-foreground">Try visiting a test site. If WequiGuard is active, harmful content should be blocked automatically.</p>
              </div>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Setup;
