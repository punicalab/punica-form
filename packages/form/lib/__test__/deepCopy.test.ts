import { deepCopy } from '..';

describe('deepCopy', () => {
  test('copies nested values without sharing references', () => {
    const source = {
      date: new Date(0),
      list: [{ a: 1 }],
      map: new Map([['key', { b: 2 }]]),
      set: new Set([{ c: 3 }])
    };
    const copy = deepCopy(source);

    expect(copy).toEqual(source);
    expect(copy.date).not.toBe(source.date);
    expect(copy.list[0]).not.toBe(source.list[0]);
    expect(copy.map.get('key')).not.toBe(source.map.get('key'));
    expect([...copy.set][0]).not.toBe([...source.set][0]);
  });

  test('keeps functions by reference', () => {
    const validation = jest.fn();

    expect(deepCopy({ validation }).validation).toBe(validation);
  });

  test('preserves the prototype of class instances', () => {
    class Entity {
      public name = 'a';
    }

    expect(deepCopy(new Entity())).toBeInstanceOf(Entity);
  });

  test('supports circular references', () => {
    const source: Record<string, unknown> = { name: 'a' };
    source.self = source;

    const copy = deepCopy(source);

    expect(copy.self).toBe(copy);
  });

  test('keeps files by reference', () => {
    const file = new File(['a'], 'a.txt');
    const copy = deepCopy({ files: [file], file });

    expect(copy.file).toBe(file);
    expect(copy.files).toEqual([file]);
    expect(copy.files[0]).toBe(file);
  });
});
