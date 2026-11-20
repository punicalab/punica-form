import { isEqual } from '..';

describe('isEqual', () => {
  test('compares objects, arrays, dates, maps and sets by their content', () => {
    expect(isEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
    expect(isEqual(new Date(5), new Date(5))).toBe(true);
    expect(isEqual(new Map([['a', [1]]]), new Map([['a', [1]]]))).toBe(true);
    expect(isEqual(new Set([1, 2]), new Set([2, 1]))).toBe(true);
    expect(isEqual(NaN, NaN)).toBe(true);
  });

  test('tells different values apart', () => {
    expect(isEqual({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(isEqual({ a: undefined }, { b: undefined })).toBe(false);
    expect(isEqual([1, 2], [2, 1])).toBe(false);
    expect(isEqual([], {})).toBe(false);
    expect(isEqual(new Date(5), new Date(6))).toBe(false);
    expect(isEqual(new Set([1]), new Set([2]))).toBe(false);
    expect(isEqual(new Map([['a', 1]]), new Map([['a', 2]]))).toBe(false);
    expect(isEqual('', undefined)).toBe(false);
    expect(isEqual(null, {})).toBe(false);
  });

  test('follows circular references', () => {
    const create = (name: string) => {
      const node: Record<string, unknown> = { name };

      node.self = node;

      return node;
    };

    expect(isEqual(create('a'), create('a'))).toBe(true);
    expect(isEqual(create('a'), create('b'))).toBe(false);
  });

  test('compares the members of sets and the keys of maps by their content', () => {
    expect(isEqual(new Set([{ id: 1 }]), new Set([{ id: 1 }]))).toBe(true);
    expect(isEqual(new Set([{ id: 1 }]), new Set([{ id: 2 }]))).toBe(false);
    expect(
      isEqual(new Map([[{ id: 1 }, 'a']]), new Map([[{ id: 1 }, 'a']]))
    ).toBe(true);
    expect(
      isEqual(new Map([['a', undefined]]), new Map([['b', undefined]]))
    ).toBe(false);
  });

  test('regular expressions by their source, other objects without properties by identity', () => {
    class Handle {}

    expect(isEqual(/a/g, /a/g)).toBe(true);
    expect(isEqual(/a/g, /a/i)).toBe(false);
    expect(isEqual(new Handle(), new Handle())).toBe(false);
    expect(isEqual({}, {})).toBe(true);
    expect(isEqual([], [])).toBe(true);
  });
});
