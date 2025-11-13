import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export const ContentLoading = ({ message = "Loading content..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
    <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
    <p className="mt-4 text-sm font-medium">{message}</p>
  </div>
);

export const ContentError = ({
  title = "We couldn't load this section.",
  description = "Please try again in a moment.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <p className="text-lg font-semibold text-destructive">{title}</p>
    <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    {onRetry ? (
      <Button variant="outline" className="mt-6" onClick={onRetry}>
        Try again
      </Button>
    ) : null}
  </div>
);
