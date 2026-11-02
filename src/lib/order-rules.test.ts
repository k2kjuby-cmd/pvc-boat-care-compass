import { expect,it } from 'vitest';
import { minimumShortfall,canAddToCart,checkoutSchema } from './order-rules';
it('розничный минимум 3000 ₽',()=>{expect(minimumShortfall(2000,false)).toBe(1000);expect(minimumShortfall(3000,false)).toBe(0);});
it('дилерам минимум не применяется',()=>{expect(minimumShortfall(100,true)).toBe(0);});
it('минимум можно выключить',()=>{expect(minimumShortfall(100,false,false)).toBe(0);});
it('скоро и скрытые нельзя добавлять',()=>{expect(canAddToCart('soon',true,400)).toBe(false);expect(canAddToCart('hidden',true,400)).toBe(false);expect(canAddToCart('published',true,400)).toBe(true);});
it('организация требует реквизиты, согласие обязательно',()=>{const d={items:[{variant_id:'c4dae71b-fcf4-4cdf-a514-5ba87b5251eb',quantity:2}],customer:{name:'Тест',phone:'+79770000000',email:'test@example.com',city:'Москва',address:'Адрес',comment:'',messenger_type:'',messenger_contact:'',company:'',inn:'',kpp:'',consent:true},buyer_type:'organization',delivery:'cdek',payment:'invoice'};expect(checkoutSchema.safeParse(d).success).toBe(false);expect(checkoutSchema.safeParse({...d,buyer_type:'person',customer:{...d.customer,consent:false}}).success).toBe(false);});