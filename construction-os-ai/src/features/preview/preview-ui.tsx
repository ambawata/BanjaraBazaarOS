import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-300">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-black/50 dark:text-white/45">{label}</p>
          <p className="truncate font-display text-lg font-semibold tracking-tight">{value}</p>
          {hint && <p className="truncate text-xs text-black/40 dark:text-white/35">{hint}</p>}
        </div>
      </div>
    </Card>
  );
}

export function PageHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-soft">
        <Icon className="size-5" />
      </div>
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-0.5 text-sm text-black/55 dark:text-white/50">{description}</p>
      </div>
    </div>
  );
}

export function Pill({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode;
  variant?: NonNullable<VariantProps<typeof badgeVariants>["variant"]>;
}) {
  return <Badge variant={variant}>{children}</Badge>;
}

export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-500/20 dark:text-primary-200",
        className,
      )}
    >
      {initials}
    </div>
  );
}
