import type { ReactNode } from "react";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: ReactNode;
  mainClassName?: string;
  withFooter?: boolean;
}

const PageLayout = ({ children, mainClassName, withFooter = true }: PageLayoutProps) => (
  <div className="flex min-h-screen flex-col bg-background text-foreground">
    <Header />
    <main className={cn("flex-1", mainClassName)}>{children}</main>
    {withFooter ? <Footer /> : null}
  </div>
);

export default PageLayout;
