import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MODES = [
  { ratio: 10, label: "1:10", hint: "сильные загрязнения" },
  { ratio: 30, label: "1:30", hint: "регулярная мойка" },
];

const fmt = (ml: number) => (ml >= 1000 ? `${(ml / 1000).toLocaleString("ru-RU", { maximumFractionDigits: 2 })} л` : `${Math.round(ml).toLocaleString("ru-RU")} мл`);

export function DilutionCalc() {
  const [conc, setConc] = useState(100);
  const [ratio, setRatio] = useState(10);
  const water = Math.max(0, conc) * ratio;
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="conc">Объём концентрата, мл</Label>
          <Input id="conc" type="number" min={1} max={100000} value={conc} onChange={(e) => setConc(Number(e.target.value) || 0)} className="bg-background" />
          <div className="flex flex-wrap gap-2 pt-1">
            {[50, 100, 300, 500, 1000].map((v) => (
              <button key={v} type="button" onClick={() => setConc(v)} className={`rounded-full border px-3 py-1 text-xs ${conc === v ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{v} мл</button>
            ))}
          </div>
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Режим</legend>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map((m) => (
              <button key={m.ratio} type="button" onClick={() => setRatio(m.ratio)} aria-pressed={ratio === m.ratio} className={`rounded-xl border p-3 text-left ${ratio === m.ratio ? "border-primary bg-primary/10" : "border-border"}`}>
                <span className="block font-display text-lg">{m.label}</span>
                <span className="text-xs text-muted-foreground">{m.hint}</span>
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2" aria-live="polite">
        <div className="rounded-xl bg-background p-4"><div className="text-xs text-muted-foreground">Добавить воды</div><div className="font-display text-2xl">{fmt(water)}</div></div>
        <div className="rounded-xl bg-background p-4"><div className="text-xs text-muted-foreground">Получится раствора</div><div className="font-display text-2xl text-primary">{fmt(water + conc)}</div></div>
      </div>
    </div>
  );
}
