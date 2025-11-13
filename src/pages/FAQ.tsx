import PageLayout from "@/components/layout/PageLayout";
import { ContentError, ContentLoading } from "@/components/ContentState";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useFaqContent } from "@/hooks/useContentData";

const FAQ = () => {
  const { data, isPending, isError, refetch } = useFaqContent();

  if (isPending) {
    return (
      <PageLayout>
        <ContentLoading message="Loading FAQs..." />
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
      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="mb-12 space-y-4 text-center">
            <h1 className="text-4xl font-bold md:text-5xl">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground">Everything you need to know about WequiGuard.</p>
          </div>

          <Card className="p-8">
            <Accordion type="single" collapsible className="w-full">
              {data.faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <Card className="mt-12 border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5 p-8 text-center">
            <h3 className="mb-4 text-2xl font-semibold">Still have questions?</h3>
            <p className="mb-6 text-muted-foreground">
              We're here to help. Reach out to our support team and we'll respond as soon as possible.
            </p>
            <a href={`mailto:${data.contactEmail}`} className="inline-block font-semibold text-primary hover:underline">
              {data.contactEmail}
            </a>
          </Card>
        </div>
      </section>
    </PageLayout>
  );
};

export default FAQ;
