import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageLayout mainClassName="flex flex-1 items-center justify-center bg-muted/40">
      <section className="container max-w-xl py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Error 404</p>
        <h1 className="mt-4 text-4xl font-bold">Page not found</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          The page you're looking for might have been moved, removed, or is temporarily unavailable.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link to="/">
            <Button size="lg">Return home</Button>
          </Link>
          <Link to="/faq">
            <Button size="lg" variant="outline">
              Visit FAQ
            </Button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
};

export default NotFound;
