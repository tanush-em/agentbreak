import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  CRITICAL: "border-critical/30 bg-critical/10 text-critical",
  HIGH: "border-high/30 bg-high/10 text-high",
  MEDIUM: "border-medium/30 bg-medium/10 text-medium",
  LOW: "border-low/30 bg-low/10 text-low",
  INFO: "border-border bg-muted text-muted-foreground",
  SECURE: "border-success/30 bg-success/10 text-success",
  VULNERABLE: "border-critical/30 bg-critical/10 text-critical",
  RESISTED: "border-success/30 bg-success/10 text-success",
  RUNNING: "border-low/30 bg-low/10 text-low",
  QUEUED: "border-border bg-muted text-muted-foreground",
  COMPLETED: "border-success/30 bg-success/10 text-success",
  FAILED: "border-critical/30 bg-critical/10 text-critical",
  DRAFT: "border-border bg-muted text-muted-foreground",
  REAL: "border-success/30 bg-success/10 text-success",
  SIMULATED: "border-border bg-muted text-muted-foreground",
  COMING_SOON: "border-border bg-transparent text-muted-foreground",
  ERROR: "border-critical/30 bg-critical/10 text-critical",
};

export function SeverityBadge({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const label = value.replace(/_/g, " ");
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-sm px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide",
        styles[value] || styles.INFO,
        className
      )}
    >
      {label}
    </Badge>
  );
}
