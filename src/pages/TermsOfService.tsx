import PageLayout from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/card";

const commitments = [
  {
    title: "Using WequiGuard",
    points: [
      "You must be at least 18 and provide accurate account information.",
      "Do not misuse the service, attempt to break security, or harm network stability.",
      "Compliance with applicable laws is required wherever you use WequiGuard.",
    ],
  },
  {
    title: "Accounts & Security",
    points: [
      "You are responsible for safeguarding login credentials and devices.",
      "Notify us immediately if you suspect unauthorized access to your account.",
      "We may suspend access to protect the service or other customers from abuse.",
    ],
  },
  {
    title: "Payments & Renewals",
    points: [
      "Fees are billed per the plan you select; charges are non-refundable unless required by law.",
      "Plans renew automatically until you change or cancel them in your account settings.",
      "Taxes and third-party payment processing fees may apply based on your region.",
    ],
  },
  {
    title: "Service Availability",
    points: [
      "We aim for high availability but do not guarantee uninterrupted access.",
      "Planned maintenance and urgent security fixes may cause brief downtime.",
      "We may change or discontinue features, providing notice when practical.",
    ],
  },
  {
    title: "Liability",
    points: [
      "The service is provided on an \"as is\" basis without warranties beyond those required by law.",
      "To the fullest extent allowed, our liability is limited to the amount you paid in the prior 12 months.",
      "We are not liable for indirect, incidental, or consequential damages.",
    ],
  },
  {
    title: "Termination",
    points: [
      "You may cancel at any time; access continues through the paid period unless otherwise stated.",
      "We may terminate or suspend accounts that violate these terms or legal requirements.",
      "Upon termination, your right to use the service ends and associated data may be removed.",
    ],
  },
];

const TermsOfService = () => (
  <PageLayout>
    <section className="bg-gradient-hero py-16 md:py-24">
      <div className="container max-w-5xl space-y-12 text-primary-foreground">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Legal</p>
          <h1 className="text-4xl font-bold md:text-5xl">Terms of Service</h1>
          <p className="mx-auto max-w-3xl text-lg text-white/80">
            These terms govern your use of WequiGuard. Please review them carefully so you know your rights,
            responsibilities, and how we work to protect the network.
          </p>
          <p className="text-sm text-white/70">Last updated: May 2024</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {commitments.map((section) => (
            <Card key={section.title} className="h-full border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-primary-foreground">{section.title}</h3>
                <ul className="space-y-2 text-sm text-primary-foreground/80">
                  {section.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-secondary" aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        <Card className="border-white/20 bg-background/90 p-8 text-foreground shadow-medium">
          <div className="space-y-3 text-center md:text-left">
            <h3 className="text-2xl font-semibold">Need Clarification?</h3>
            <p className="text-muted-foreground">
              If you have questions about these terms or need to report a concern, contact our support team and we will
              respond quickly.
            </p>
            <a
              href="mailto:support@wequiguard.com"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:shadow-medium"
            >
              support@wequiguard.com
            </a>
          </div>
        </Card>
      </div>
    </section>
  </PageLayout>
);

export default TermsOfService;
