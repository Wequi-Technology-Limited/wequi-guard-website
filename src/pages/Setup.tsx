import { useEffect, useState } from "react";

import PageLayout from "@/components/layout/PageLayout";
import { ContentError, ContentLoading } from "@/components/ContentState";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSetupContent } from "@/hooks/useContentData";
import { getIconByName } from "@/lib/icon-map";
import type { DeviceType } from "@/types/content";

const Setup = () => {
  const { data, isPending, isError, refetch } = useSetupContent();
  const [selectedDevice, setSelectedDevice] = useState<DeviceType | undefined>(undefined);

  useEffect(() => {
    if (!selectedDevice && data?.guides.length) {
      setSelectedDevice(data.guides[0].id);
    }
  }, [data, selectedDevice]);

  if (isPending || (!data && !selectedDevice)) {
    return (
      <PageLayout>
        <ContentLoading message="Loading setup guide..." />
      </PageLayout>
    );
  }

  if (isError || !data) {
    return (
      <PageLayout>
        <ContentError onRetry={() => refetch()} />
      </PageLayout>
    );
  }

  const dnsServers = data.dnsServers;
  const activeDevice = selectedDevice ?? data.guides[0].id;

  return (
    <PageLayout>
      <section className="py-20">
        <div className="container max-w-5xl">
          <div className="mb-12 space-y-4 text-center">
            <h1 className="text-4xl font-bold md:text-5xl">Get Protected in 5 Minutes</h1>
            <p className="text-lg text-muted-foreground">Choose your device or router below for step-by-step instructions.</p>
          </div>

          <Card className="mb-12 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 p-8">
            <h3 className="mb-4 text-center text-xl font-semibold">WequiGuard DNS Servers</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                { label: "Primary DNS", value: dnsServers.primary, accent: "text-primary" },
                { label: "Secondary DNS", value: dnsServers.secondary, accent: "text-secondary" },
              ].map((server) => (
                <div key={server.label} className="text-center">
                  <p className="mb-2 text-sm text-muted-foreground">{server.label}</p>
                  <p className={`font-mono text-3xl font-bold ${server.accent}`}>{server.value}</p>
                </div>
              ))}
            </div>
          </Card>

          <Tabs value={activeDevice} onValueChange={(value) => setSelectedDevice(value as DeviceType)} className="space-y-8">
            <TabsList className="grid h-auto w-full grid-cols-2 md:grid-cols-4">
              {data.guides.map((guide) => {
                const Icon = getIconByName(guide.icon);
                return (
                  <TabsTrigger key={guide.id} value={guide.id} className="flex flex-col items-center gap-2 py-4">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="text-sm font-semibold">{guide.name}</span>
                    {guide.recommended ? (
                      <span className="text-xs text-primary">Recommended</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">&nbsp;</span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {data.guides.map((guide) => (
              <TabsContent key={guide.id} value={guide.id} className="space-y-6">
                {guide.sections.map((section, index) => (
                  <Card key={`${guide.id}-${index}`} className="space-y-6 p-8">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold">{guide.name}</h3>
                      <p className="text-base text-muted-foreground">{guide.description}</p>
                      {section.heading ? <p className="text-lg font-semibold text-primary">{section.heading}</p> : null}
                      {section.description ? <p className="text-sm text-muted-foreground">{section.description}</p> : null}
                    </div>
                    <ol className="list-inside list-decimal space-y-6 text-foreground">
                      {section.steps.map((step) => (
                        <li key={step.title} className="text-lg">
                          <span className="font-semibold">{step.title}</span>
                          <p className="mt-2 text-base text-muted-foreground">{step.description}</p>
                          {step.callouts ? (
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              {step.callouts.map((callout) => (
                                <div key={callout.label} className="rounded-lg border bg-muted/40 p-4 text-sm">
                                  <p className="text-muted-foreground">{callout.label}</p>
                                  <p className="font-mono text-xl font-semibold text-foreground">{callout.value}</p>
                                </div>
                              ))}
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  </Card>
                ))}
              </TabsContent>
            ))}
          </Tabs>

          <Card className="mt-12 bg-muted/30 p-8">
            <h3 className="mb-6 text-2xl font-semibold">Having Trouble?</h3>
            <div className="space-y-4">
              {data.troubleshooting.map((tip) => (
                <div key={tip.title}>
                  <h4 className="mb-2 font-semibold">{tip.title}</h4>
                  <p className="text-muted-foreground">{tip.description}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </PageLayout>
  );
};

export default Setup;
