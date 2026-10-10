import { Link } from "@tanstack/react-router";
import { Checkbox } from "@/components/ui/checkbox";

export function ConsentFields({ consent, newsletter, onConsent, onNewsletter, newsRequired = false }: {
  consent: boolean; newsletter: boolean; onConsent: (value: boolean) => void; onNewsletter: (value: boolean) => void; newsRequired?: boolean;
}) {
  return <div className="space-y-3 text-sm text-muted-foreground">
    <label className="flex items-start gap-2"><Checkbox required aria-label="Согласие на обработку персональных данных" checked={consent} onCheckedChange={v => onConsent(v === true)} className="mt-0.5" /><span>Я согласен на обработку персональных данных в соответствии с <Link to="/politika-konfidencialnosti" className="underline">политикой конфиденциальности</Link> *</span></label>
    <label className="flex items-start gap-2"><Checkbox required={newsRequired} aria-label="Согласие на рассылку" checked={newsletter} onCheckedChange={v => onNewsletter(v === true)} className="mt-0.5" /><span>Я согласен получать новости и рассылку НеСдует{newsRequired ? " *" : " (необязательно)"}</span></label>
  </div>;
}