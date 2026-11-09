import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/components/catalog/CartProvider';
import { getDealerCatalog, type DealerRow } from '@/lib/dealer.functions';
import { formatPrice } from '@/lib/catalog';
import { seo } from '@/lib/site';

export const Route = createFileRoute('/_authenticated/kabinet/')({ head: () => seo('Оптовый каталог', 'Оптовые цены дилера НеСдует.', '/kabinet'), component: DealerCatalog });

const pack = (r: DealerRow) => [r.volume_ml && `${r.volume_ml} мл`, r.weight_g && `${r.weight_g} г`].filter(Boolean).join(' · ');

function exportRows(rows: DealerRow[]) { return rows.map(r => ({ 'Товар': r.name, 'Фасовка': pack(r), SKU: r.sku ?? '', 'РРЦ, ₽': r.retail_price, 'Оптовая цена, ₽': r.wholesale_price, 'Минимальная партия, шт.': r.minimum_quantity })); }

function DealerCatalog() {
  const [qty, setQty] = useState<Record<string, number>>({});
  const fetchCatalog = useServerFn(getDealerCatalog); const cart = useCart();
  const q = useQuery({ queryKey: ['dealer-catalog', qty], queryFn: () => fetchCatalog({ data: { quantities: qty } }), placeholderData: keepPreviousData, retry: false });
  async function base() { return fetchCatalog({ data: { quantities: {} } }); }
  async function excel() { try { const XLSX = await import('xlsx'); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(exportRows(await base())), 'Прайс'); XLSX.writeFile(wb, 'nesduet-opt.xlsx'); } catch { toast.error('Не удалось сформировать прайс'); } }
  async function pdf() {
    const w = window.open('', '_blank'); if (!w) { toast.error('Разрешите всплывающие окна'); return; }
    const rows = exportRows(await base()); const esc = (s: unknown) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
    w.document.write(`<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Оптовый прайс НеСдует</title><style>body{font-family:Arial,sans-serif;padding:24px}table{border-collapse:collapse;width:100%;font-size:12px}td,th{border:1px solid #999;padding:6px;text-align:left}</style></head><body><h1>НЕСДУЕТ — оптовый прайс</h1><p>${esc(new Date().toLocaleDateString('ru-RU'))}</p><table><tr>${Object.keys(rows[0] ?? {}).map(k => `<th>${esc(k)}</th>`).join('')}</tr>${rows.map(r => `<tr>${Object.values(r).map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</table><script>window.onload=()=>window.print()</script></body></html>`);
    w.document.close();
  }
  return <div>
    <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={excel}>Скачать прайс Excel</Button><Button variant="outline" onClick={pdf}>Скачать прайс PDF</Button><Button asChild><Link to="/korzina">Перейти в корзину</Link></Button></div>
    <p className="mt-3 text-sm text-muted-foreground">Для дилеров минимальной суммы заказа нет. Цена пересчитывается по количеству.</p>
    {q.isError && <p className="mt-6 text-destructive">Оптовые цены недоступны.</p>}
    <div className="mt-6 divide-y divide-border">{q.data?.map(r => {
      const n = qty[r.variant_id] ?? 1;
      return <div key={r.variant_id} className="grid gap-3 py-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="min-w-0"><Link to="/katalog/$slug" params={{ slug: r.slug }} className="font-display">{r.name}</Link>{pack(r) && <span className="ml-2 text-sm text-muted-foreground">{pack(r)}</span>}
          <p className="mt-1"><span className="font-display text-lg">{formatPrice(r.wholesale_price)}</span> <span className="text-sm text-muted-foreground">· РРЦ {formatPrice(r.retail_price)} · мин. партия {r.minimum_quantity} шт.{r.level && ` · ${r.level}`}</span></p>
          {r.next_quantity != null && r.next_discount != null && <p className="mt-1 text-sm text-primary">ещё {r.next_quantity - n} шт. до скидки {r.next_discount}%</p>}
        </div>
        <div className="flex items-center gap-2"><Input aria-label={`Количество ${r.name} ${pack(r)}`} className="w-24" type="number" min="1" max="1000000" value={n} onChange={e => setQty({ ...qty, [r.variant_id]: Math.max(1, Math.min(1000000, Math.floor(Number(e.target.value) || 1))) })} /><Button onClick={() => { cart.set(r.variant_id, n); toast.success('Добавлено в корзину'); }}>В корзину</Button></div>
      </div>;
    })}</div>
  </div>;
}
