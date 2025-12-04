import PageLayout from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/card";

const privacySections = [
  {
    title: "Information We Collect",
    description: "We only gather the minimum details needed to run WequiGuard and support you.",
    items: [
      "Account details such as name, email, and authentication data you provide.",
      "Service usage signals like connection timestamps, device type, and DNS request counts to keep the network reliable.",
      "Support conversations when you contact us for help.",
    ],
  },
  {
    title: "How We Use It",
    description: "Data is used to operate, secure, and improve the service—not for ads or resale.",
    items: [
      "Deliver core features like dashboard access, device management, and alerts.",
      "Detect abuse, maintain uptime, and troubleshoot performance issues.",
      "Communicate essential updates, billing notices, and support responses.",
    ],
  },
  {
    title: "What We Do Not Collect",
    description: "Privacy is the default: we avoid sensitive or unnecessary data.",
    items: [
      "We do not log the contents of your DNS lookups or browsing history.",
      "We do not sell, rent, or trade your personal information to third parties.",
      "We do not use tracking pixels or third-party ad networks inside the product.",
    ],
  },
  {
    title: "Retention & Security",
    description: "We keep data only as long as needed for the stated purposes.",
    items: [
      "Operational logs are trimmed on a rolling schedule and minimized by design.",
      "Access to data is restricted to trained staff with clear business needs.",
      "We use encryption in transit and follow least-privilege access controls.",
    ],
  },
  {
    title: "Your Controls",
    description: "You are in control of your account and how we communicate with you.",
    items: [
      "Update profile and security settings from your account at any time.",
      "Request access, correction, or deletion of your personal information.",
      "Opt out of non-essential emails via in-message links or by contacting support.",
    ],
  },
];

const PrivacyPolicy = () => (
  <PageLayout>
    <section className="bg-gradient-feature py-16 md:py-24">
      <div className="container max-w-5xl space-y-12">
        <div className="space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Privacy First</p>
          <h1 className="text-4xl font-bold md:text-5xl">Privacy Policy</h1>
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            WequiGuard is built to shield your digital life. This policy explains what we collect, how we use it, and
            the controls available to you.
          </p>
          <p className="text-sm text-muted-foreground">Last updated: May 2024</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {privacySections.map((section) => (
            <Card
              key={section.title}
              className="h-full border-2 border-primary/10 bg-background/90 p-6 shadow-soft backdrop-blur"
            >
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">{section.title}</h3>
                <p className="text-sm text-muted-foreground">{section.description}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        <Card className="border-primary/20 bg-primary text-primary-foreground shadow-medium">
          <div className="space-y-3 p-8 text-center md:text-left">
            <h3 className="text-2xl font-semibold">Questions or Requests</h3>
            <p className="text-primary-foreground/90">
              If you want to exercise your privacy rights or have questions about this policy, email us and we will help
              promptly.
            </p>
            <a
              href="mailto:support@wequiguard.com"
              className="inline-flex items-center justify-center rounded-md bg-white/10 px-4 py-2 text-sm font-semibold underline-offset-4 hover:underline"
            >
              support@wequiguard.com
            </a>
          </div>
        </Card>
      </div>
    </section>
  </PageLayout>
);

export default PrivacyPolicy;
