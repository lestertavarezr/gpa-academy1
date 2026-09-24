import { describe, it, expect } from 'vitest';
import { modules, cases, dressings, sources, moduleNote } from '../src/data.js';

const optionIds = step => step.options.map(o => (typeof o === 'string' ? o : o.id));

describe('contenido de los casos', () => {
  it('tiene ids de caso únicos', () => {
    expect(new Set(cases.map(c => c.id)).size).toBe(cases.length);
  });

  for (const c of cases) {
    describe(c.id, () => {
      it('pertenece a un módulo existente con nota', () => {
        expect(modules.some(m => m.id === c.module)).toBe(true);
        expect(moduleNote[c.module]).toBeTruthy();
      });

      c.steps.forEach((step, i) => {
        it('decisión ' + (i + 1) + ' es coherente', () => {
          const ids = optionIds(step);
          expect(new Set(ids).size).toBe(ids.length);
          expect(sources[step.source], 'fuente ' + step.source).toBeDefined();
          expect(step.explanation).toBeTruthy();
          if (step.kind === 'select') {
            expect(Array.isArray(step.correct)).toBe(true);
            expect(step.correct.length).toBeLessThan(ids.length);
            step.correct.forEach(id => expect(ids).toContain(id));
          } else {
            expect(ids).toContain(step.correct);
          }
          if (step.kind === 'dressing') ids.forEach(id => expect(dressings.some(d => d.id === id), id).toBe(true));
        });
      });
    });
  }
});
