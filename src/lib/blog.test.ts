import { describe, it, expect } from 'vitest';
import { parseBody } from './blog';
describe('parseBody', () => {
  it('headings, paragraphs, photos', () => {
    const b = parseBody('## Шаг\nтекст\n\n![До ремонта](https://x.ru/a.jpg)\n\n![Схема|иллюстрация](https://x.ru/b.jpg)');
    expect(b.map(x => x.t)).toEqual(['h2', 'p', 'img', 'img']);
    expect(b[2]).toMatchObject({ illustrative: false, caption: 'До ремонта' });
    expect(b[3]).toMatchObject({ illustrative: true, caption: 'Схема' });
  });
  it('non-https images stay text', () => expect(parseBody('![x](http://a.ru/b.jpg)')[0]!.t).toBe('p'));
});
