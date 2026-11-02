import { createFileRoute,Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { catalogQuery,formatPrice } from '@/lib/catalog';
import { PageShell } from '@/components/site/PageShell';
import { Button } from '@/components/ui/button';
import { DealerPrice } from '@/components/catalog/DealerPrice';
import { seo } from '@/lib/site';
export const Route=createFileRoute('/_authenticated/optovyj-prajs')({head:()=>seo('Оптовый прайс','Цены для одобренных дилеров НеСдует.','/optovyj-prajs'),loader:({context})=>context.queryClient.ensureQueryData(catalogQuery),component:DealerCatalog});
function DealerCatalog(){const {data}=useSuspenseQuery(catalogQuery);return <PageShell title="Оптовый прайс" crumbs={[{label:'Оптовый прайс'}]}><div className="divide-y divide-border">{data.filter(p=>p.status==='published').map(p=><div key={p.id} className="flex flex-wrap items-center justify-between gap-4 py-5"><div><h2 className="text-lg">{p.name}</h2>{p.minPrice!=null&&<p className="mt-1 text-sm text-muted-foreground">РРЦ от {formatPrice(p.minPrice)}</p>}</div><Button asChild variant="outline"><Link to="/katalog/$slug" params={{slug:p.slug}}>Фасовки и оптовые цены</Link></Button></div>)}</div></PageShell>}