import PageLayout from "@/components/layout/PageLayout";
import { ContentError, ContentLoading } from "@/components/ContentState";
import { Card } from "@/components/ui/card";
import { useFeatureContent } from "@/hooks/useContentData";
import { getIconByName } from "@/lib/icon-map";

const accentBg: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent",
};

const Features = () => {
  const { data, isPending, isError, refetch } = useFeatureContent();

  if (isPending) {
    return (
      <PageLayout>
        <ContentLoading message="Loading feature highlights..." />
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

  return (
    <PageLayout>
      <section className="bg-gradient-feature py-20">
          <div className="container">
            <div className="mb-16 space-y-4 text-center">
              <h1 className="text-4xl font-bold md:text-5xl">{data.title}</h1>
              <p className="mx-auto max-w-3xl text-lg text-muted-foreground">{data.description}</p>
            </div>

            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
              {data.features.map((feature) => {
                const Icon = getIconByName(feature.icon);
                return (
                  <Card
                    key={feature.title}
                    className="space-y-4 p-8 shadow-soft transition-all hover:-translate-y-1 hover:shadow-medium"
                  >
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${accentBg[feature.accent]}`}>
                      <Icon className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-primary py-20 text-primary-foreground">
          <div className="container space-y-6 text-center">
            <h2 className="text-3xl font-bold md:text-4xl">{data.supportingStatement.title}</h2>
            <p className="mx-auto max-w-2xl text-lg opacity-90">{data.supportingStatement.description}</p>
          </div>
        </section>
    </PageLayout>
  );
};

export default Features;
