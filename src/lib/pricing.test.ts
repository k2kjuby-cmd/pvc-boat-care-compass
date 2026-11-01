import { describe, expect, it } from 'vitest';
import { retailPrice, wholesalePrice, bestLevel } from './pricing';
describe('розничная сетка', () => {
  const anti = { auto_pricing: true, reference_volume_ml: 500, reference_price: 2000, pricing_step_percent: 10 };
  it('Антипрокол: линейные 10 пунктов', () => { expect([300,1000,5000].map(v => retailPrice(anti,v,false,null))).toEqual([1320,3600,16000]); });
  it('Lite: эталон 1300', () => { expect([100,300,500,1000,5000].map(v => retailPrice({...anti,reference_price:1300},v,false,null))).toEqual([312,858,1300,2340,10400]); });
  it('очиститель: 5 пунктов', () => { expect([100,300,500,1000,5000].map(v => retailPrice({auto_pricing:true,reference_volume_ml:100,reference_price:300,pricing_step_percent:5},v,false,null))).toEqual([300,855,1350,2550,12000]); });
  it('ручная цена отключает расчёт', () => { expect(retailPrice(anti,300,true,999)).toBe(999); });
  it('одиночные цены остаются отдельными', () => { expect(retailPrice({auto_pricing:false},40,false,250)).toBe(250); });
  it('округление до рублей', () => { expect(retailPrice({...anti,reference_price:2001},300,false,null)).toBe(1321); });
});
describe('опт', () => {
  it('минимум при 30% и 6% = себестоимость / 0,64', () => { const q=wholesalePrice(2000,{cost_price:640,minimum_margin_percent:30},50,6); expect(q.minimum).toBe(1000); expect(q.margin).toBeCloseTo(30); });
  it('ограничение отвердителя 35% раньше минимума', () => { expect(wholesalePrice(400,{max_discount_percent:35},50).price).toBe(260); });
  it('защита маржи после скидки', () => { const q=wholesalePrice(1000,{cost_price:640},50); expect(q.price).toBe(1000); expect(q.limited).toBe(true); });
  it('недопустимый знаменатель отклоняется', () => { expect(()=>wholesalePrice(1000,{minimum_margin_percent:94},15,6)).toThrow(); });
  const levels=[{id:'d',name:'Дилер',discount_percent:15,quantity_multiplier:null,manual_only:false,sort:0},{id:'1',name:'Опт 1',discount_percent:25,quantity_multiplier:1,manual_only:false,sort:1},{id:'2',name:'Опт 2',discount_percent:35,quantity_multiplier:2,manual_only:false,sort:2},{id:'x',name:'Дистрибьютор',discount_percent:50,quantity_multiplier:null,manual_only:true,sort:3}];
  it('лучший уровень по количеству одной фасовки',()=>{ expect([1,100,200].map(n=>bestLevel(levels,n,100)?.discount_percent)).toEqual([15,25,35]); });
  it('дистрибьютор назначается вручную',()=>{ expect(bestLevel(levels,1,100,'x')?.discount_percent).toBe(50); });
});