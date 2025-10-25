import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const FAQ = () => {
  const faqs = [
    {
      question: "Is WequiGuard really free?",
      answer: "Yes! WequiGuard is completely free to use. We are committed to providing a safe browsing experience for everyone. There are no hidden fees, subscriptions, or premium tiers.",
    },
    {
      question: "How does WequiGuard work?",
      answer: "WequiGuard uses DNS (Domain Name System) filtering. When you try to visit a website, your device asks a DNS server to translate the website name into an IP address. WequiGuard checks this request against our database of blocked categories. If it's blocked, the page won't load.",
    },
    {
      question: "Will it slow down my internet?",
      answer: "Typically, no. DNS resolution is a very fast process that happens in milliseconds. Many users don't notice any difference in speed, and some may even see an improvement because harmful sites are blocked before they can load.",
    },
    {
      question: "Can I whitelist or blacklist specific websites?",
      answer: "Currently, WequiGuard uses pre-configured category-based filtering to ensure simplicity and reliability for all users. Custom whitelist and blacklist features are on our roadmap and may be added in future updates.",
    },
    {
      question: "Do you log my browsing data?",
      answer: "No. We are committed to your privacy. We do not log your browsing history, DNS queries, or personal information. Our service is designed with privacy as a core principle, and we will never sell your data to third parties.",
    },
    {
      question: "What if I need help with the setup?",
      answer: "We've created a comprehensive Setup Guide with step-by-step instructions for all major devices and routers. If you're still having trouble, you can reach out to our support team via email, and we'll be happy to help you get protected.",
    },
    {
      question: "Does it work on all devices?",
      answer: "Yes! When you set up WequiGuard on your router, it protects every device connected to your Wi-Fi network—smartphones, tablets, laptops, smart TVs, gaming consoles, and more. You can also set it up on individual devices if you prefer.",
    },
    {
      question: "What categories of content are blocked?",
      answer: "WequiGuard blocks multiple categories including adult content and pornography, gambling sites, malware and phishing sites, violent and extremist content, and other harmful material. We also enforce SafeSearch on major search engines.",
    },
    {
      question: "Can I use WequiGuard at work or school?",
      answer: "While WequiGuard is designed primarily for home use, it can be used in any environment where you control the DNS settings. However, always check with your IT department before changing network settings in a workplace or educational institution.",
    },
    {
      question: "Is WequiGuard better than parental control software?",
      answer: "WequiGuard and traditional parental control software serve different purposes. WequiGuard provides network-level DNS filtering that's simple to set up and works on all devices. Parental control software often provides more granular controls like screen time limits and app blocking, but requires installation on each device. Many families use both approaches together for comprehensive protection.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-20">
        <div className="container max-w-4xl">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Frequently Asked Questions</h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about WequiGuard
            </p>
          </div>

          <Card className="p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left text-lg font-semibold hover:text-primary">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>

          <Card className="p-8 mt-12 bg-gradient-to-r from-primary/5 to-secondary/5 border-2 border-primary/20 text-center">
            <h3 className="text-2xl font-semibold mb-4">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">
              We're here to help! Reach out to our support team and we'll get back to you as soon as possible.
            </p>
            <a 
              href="mailto:support@wequiguard.com" 
              className="inline-block text-primary font-semibold hover:underline"
            >
              support@wequiguard.com
            </a>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FAQ;
