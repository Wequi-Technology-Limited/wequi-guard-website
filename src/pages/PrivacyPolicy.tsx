import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link2, Printer } from "lucide-react";

import PageLayout from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

type Section = {
  id: string;
  title: string;
  content: ReactNode;
};

const policyMeta = {
  effectiveDate: "December 4, 2024",
  lastUpdated: "January 31, 2026",
  supportEmail: "support@wequitech.com",
  websiteUrl: "https://wequitech.com",
  developerName: "WequiGuard",
  companyName: "Wequi Technologies",
};

const policySections: Section[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: (
      <div className="space-y-4 text-muted-foreground">
        <p>
          This Privacy Policy explains how {policyMeta.developerName} (“we”, “our”, or “us”) handles information for the
          WequiGuard mobile app, admin dashboard, and marketing site. By using our services, you agree to the collection
          and use of information as described here.
        </p>
        <p>
          The app helps families stay safer online through DNS guidance, optional blocking, and device-level controls.
          We collect only what is needed to run these features and support you.
        </p>
      </div>
    ),
  },
  {
    id: "information-collection",
    title: "Information We Collect and How We Use It",
    content: (
      <div className="space-y-5 text-muted-foreground">
        <p>
          WequiGuard gathers limited technical and usage data needed to run the service and
          improve stability. This may include your IP address, the domain names your DNS resolves, timestamps, features
          you use, device OS version, app version, and time spent in the app. We do not collect precise GPS location.
        </p>
        <p>
          Account and support details you provide (email, authentication data, messages, optional attachments) are used
          to operate your account, troubleshoot issues, and send important notices. We do not log browsing history or
          store payment card numbers.
        </p>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-950">
          <p className="font-semibold text-blue-900">What we avoid</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>No collection of precise location, contacts, SMS, photos, microphone, or camera data.</li>
            <li>No sale or rental of personal information.</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "third-party-access",
    title: "Third-Party Access and Services",
    content: (
      <div className="space-y-4 text-muted-foreground">
        <p>
          We periodically send aggregated, anonymized diagnostics to third parties to help improve reliability and app
          quality. Examples include Google Play Services, Firebase Analytics, Firebase Crashlytics, and Facebook
          Analytics (subject to your platform settings).
        </p>
        <p>
          Providers are contractually limited to using data only to deliver their services for us. We may disclose data
          if required by law, to protect rights and safety, to investigate fraud or abuse, or as part of a merger or
          acquisition.
        </p>
      </div>
    ),
  },
  {
    id: "data-retention",
    title: "Data Retention",
    content: (
      <div className="space-y-3 text-muted-foreground">
        <ul className="list-disc space-y-2 pl-5">
          <li>User-provided data is kept while you use the service and for a reasonable period afterward.</li>
          <li>Diagnostic and performance logs are retained only as long as needed for maintenance and security.</li>
          <li>Legal requirements may oblige us to retain certain records longer.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "account-deletion",
    title: "Account Deletion",
    content: (
      <div className="space-y-3 text-muted-foreground">
        <p>
          Request deletion anytime via in‑app settings (where available) or by emailing {policyMeta.supportEmail} from
          your account email. Account removal is irreversible.
        </p>
        <p>We target completion within 90 days of confirming your request</p>
      </div>
    ),
  },
  {
    id: "opt-out",
    title: "Opt-Out Rights",
    content: (
      <div className="space-y-3 text-muted-foreground">
        <ul className="list-disc space-y-2 pl-5">
          <li>Disable optional analytics (where available) or uninstall the app to stop future collection.</li>
          <li>Revoke permissions such as Accessibility, Overlay, Usage Access in system settings.</li>
          <li>If you set custom DNS for WequiGuard, revert those settings to disable network-level filtering.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "security",
    title: "Security",
    content: (
      <div className="space-y-3 text-muted-foreground">
        <p>
          We apply physical, electronic, and procedural safeguards to protect data in transit and at rest. No method is
          perfectly secure, so we encourage strong passwords, device lock screens, and keeping your OS updated.
        </p>
      </div>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: (
      <div className="space-y-3 text-muted-foreground">
        <p>
          We may revise this notice as features or regulations change. Updates will refresh the “Last updated” date and
          significant changes may be announced in‑app or via email before taking effect.
        </p>
      </div>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    content: (
      <div className="space-y-2 text-muted-foreground">
        <p>If you have privacy questions, requests, or concerns, contact us:</p>
        <ul className="space-y-1">
          <li>
            <span className="font-semibold text-foreground">Email:</span> {policyMeta.supportEmail}
          </li>
          <li>
            <span className="font-semibold text-foreground">Website:</span> {policyMeta.websiteUrl}
          </li>
          <li>
            <span className="font-semibold text-foreground">Company:</span> {policyMeta.companyName}
          </li>
        </ul>
      </div>
    ),
  },
];

const PrivacyPolicy = () => {
  const { toast } = useToast();
  const [activeId, setActiveId] = useState(policySections[0]?.id ?? "");

  useEffect(() => {
    const onScroll = () => {
      const offset = 140;
      let current = policySections[0]?.id ?? "";

      policySections.forEach((section) => {
        const el = document.getElementById(section.id);
        if (!el) return;
        if (window.scrollY + offset >= el.offsetTop) {
          current = section.id;
        }
      });

      setActiveId(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "The privacy policy URL is on your clipboard.",
      });
    } catch (error) {
      console.error("Failed to copy link", error);
      toast({
        title: "Copy failed",
        description: "Please copy the link manually from the address bar.",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const y = element.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <PageLayout>
      <header className="bg-gradient-hero text-primary-foreground">
        <div className="container max-w-6xl py-16 md:py-20">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Privacy First</p>
            <h1 className="text-4xl font-bold md:text-5xl">Privacy Policy</h1>
            <p className="max-w-3xl text-lg text-white/80">
              Learn how WequiGuard collects, uses, protects, and deletes information across our app and services.
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-white/80">
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                Effective date: {policyMeta.effectiveDate}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                Last updated: {policyMeta.lastUpdated}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:bg-white/25"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:bg-white/25"
              >
                <Link2 className="h-4 w-4" />
                Copy link
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="py-12 md:py-16">
        <div className="container max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
            <aside className="lg:sticky lg:top-24">
              <div className="rounded-xl border border-border bg-muted/40 p-4 shadow-soft">
                <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Table of Contents
                </h2>
                <nav aria-label="Privacy policy sections" className="mt-4 space-y-2">
                  {policySections.map((section, index) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition hover:bg-primary/10 ${
                        activeId === section.id ? "bg-primary/15 font-semibold text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <span className="mr-2 text-xs text-muted-foreground">{index + 1}.</span>
                      {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="space-y-6">
              {policySections.map((section, index) => (
                <Card
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-32 border border-border/80 bg-background/95 p-6 shadow-medium md:p-8"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-sm font-semibold text-primary">{index + 1}.</div>
                    <div className="space-y-4 w-full">
                      <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                      {section.content}
                    </div>
                  </div>
                </Card>
              ))}

              <Card className="border-primary/20 bg-primary text-primary-foreground shadow-medium">
                <div className="space-y-3 p-6 md:p-8">
                  <h3 className="text-2xl font-semibold">Need help or want to exercise your rights?</h3>
                  <p className="text-primary-foreground/90">
                    Reach out and we will respond promptly with answers or next steps for any privacy request.
                  </p>
                  <a
                    className="inline-flex w-fit items-center justify-center rounded-md bg-white/15 px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-white/25"
                    href={`mailto:${policyMeta.supportEmail}`}
                  >
                    {policyMeta.supportEmail}
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default PrivacyPolicy;
