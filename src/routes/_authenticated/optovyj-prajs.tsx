import { createFileRoute,Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { catalogQuery,formatPrice } from '@/lib/catalog';
import { PageShell } from '@/components/site/PageShell';
import { Button } from '@/components/ui/button';
import { useServerFn } from '@tanstack/react-start';
import { getDealerPriceList } from '@/lib/wholesale.functions';
import { toast } from 'sonner';
import { seo } from '@/lib/site';
export const Route=createFileRoute('/_authenticated/optovyj-prajs')({head:()=>seo('Оптовый прайс','Цены для одобренных дилеров НеСдует.','/optovyj-prajs'),loader:({context})=>context.queryClient.ensureQueryData(catalogQuery),component:DealerCatalog});
function DealerCatalog(){const {data}=useSuspenseQuery(catalogQuery);const fetchList=useServerFn(getDealerPriceList);async function download(){try{const rows=await fetchList();const XLSX=await import('xlsx');const wb=XLSX.utils.book_new();XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(rows.map(r=>({'Товар':r.name,'Объём, мл':r.volume_ml,'Вес, г':r.weight_g,SKU:r.sku,'РРЦ, ₽':r.retail_price,'Оптовая цена, ₽':r.wholesale_price,'Минимальная партия, шт.':r.minimum_quantity}))),'Прайс');XLSX.writeFile(wb,'nesduet-opt.xlsx');}catch{toast.error('Прайс доступен только одобренным дилерам');}}return <PageShell title="Оптовый прайс" crumbs={[{label:'Оптовый прайс'}]}><Button onClick={download} variant="outline">Скачать прайс Excel</Button><div className="divide-y divide-border">{data.filter(p=>p.status==='published').map(p=><div key={p.id} className="flex flex-wrap items-center justify-between gap-4 py-5"><div><h2 className="text-lg">{p.name}</h2>{p.minPrice!=null&&<p className="mt-1 text-sm text-muted-foreground">РРЦ от {formatPrice(p.minPrice)}</p>}</div><Button asChild variant="outline"><Link to="/katalog/$slug" params={{slug:p.slug}}>Фасовки и оптовые цены</Link></Button></div>)}</div></PageShell>}