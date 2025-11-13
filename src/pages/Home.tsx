import { Link } from "react-router-dom";

import PageLayout from "@/components/layout/PageLayout";
import { ContentError, ContentLoading } from "@/components/ContentState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHomeContent } from "@/hooks/useContentData";
import { getIconByName } from "@/lib/icon-map";

const accentStyles = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent",
};

const Home = () => {
  const { data, isPending, isError, refetch } = useHomeContent();

  if (isPending) {
    return (
      <PageLayout>
        <ContentLoading message="Loading homepage content..." />
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

  const { hero, socialProof, steps, finalCta } = data;

  return (
    <PageLayout mainClassName="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
        <div className="container relative z-10">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-6 text-center lg:text-left">
              <h1 className="text-4xl font-bold leading-tight text-primary-foreground md:text-5xl lg:text-6xl">
                {hero.title}
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-primary-foreground/90 md:text-xl lg:mx-0">
                {hero.description}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Link to={hero.primaryCta.href}>
                  <Button
                    size="lg"
                    variant={hero.primaryCta.variant ?? "default"}
                    className="text-lg shadow-large hover:shadow-medium transition-all"
                  >
                    {hero.primaryCta.label}
                  </Button>
                </Link>
                {hero.secondaryCta ? (
                  <Link to={hero.secondaryCta.href}>
                    <Button
                      size="lg"
                      variant={hero.secondaryCta.variant ?? "outline"}
                      className="text-lg bg-white/10 text-white border-white/30 hover:bg-white/20"
                    >
                      {hero.secondaryCta.label}
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="hidden lg:block">
              <img
                src={hero.media.src}
                alt={hero.media.alt}
                className="h-auto w-full animate-in fade-in zoom-in duration-1000 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary-light py-12">
        <div className="container">
          <div className="flex flex-col items-center justify-center gap-8 text-center md:flex-row">
            {socialProof.map((item) => {
              const Icon = getIconByName(item.icon);
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-secondary" aria-hidden="true" />
                  <div className="space-y-0">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-gradient-feature py-20">
        <div className="container">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Online Safety in 3 Simple Steps</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">Get protected in just minutes with our guided process.</p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = getIconByName(step.icon);
              return (
                <Card key={step.title} className="space-y-4 p-8 text-center shadow-soft transition-shadow hover:-translate-y-1 hover:shadow-medium">
                  <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${accentStyles[step.accent]}`}>
                    <Icon className="h-8 w-8" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-primary py-20 text-primary-foreground">
        <div className="container space-y-6 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">{finalCta.heading}</h2>
          <p className="mx-auto max-w-2xl text-lg opacity-90">{finalCta.subheading}</p>
          <Link to={finalCta.cta.href}>
            <Button size="lg" variant={finalCta.cta.variant ?? "secondary"} className="text-lg shadow-large">
              {finalCta.cta.label}
            </Button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
};

export default Home;
