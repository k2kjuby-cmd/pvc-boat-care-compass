import { Search, Droplet, Brush, Timer, Wind, CheckCircle2, Shield, Wrench, Gauge, Sun, Scissors, Waves, Sparkles, ShieldAlert, FlaskConical, type LucideIcon } from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  search: Search, droplet: Droplet, brush: Brush, timer: Timer, wind: Wind, check: CheckCircle2,
  shield: Shield, wrench: Wrench, gauge: Gauge, sun: Sun, scissors: Scissors, waves: Waves,
  sparkles: Sparkles, "shield-alert": ShieldAlert, flask: FlaskConical,
};

export function StepIcon({ name, className }: { name?: string | null | undefined; className?: string }) {
  const I = (name && ICONS[name]) || Droplet;
  return <I className={className} aria-hidden />;
}
