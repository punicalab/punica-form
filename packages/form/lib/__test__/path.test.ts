import { readPropertyPath, writeToPropertyPath } from '..';

describe('property paths', () => {
  const entity = { address: { city: 'x' }, phones: [{ number: '1' }] };

  test('read nested values, items of arrays and missing paths', () => {
    expect(readPropertyPath(entity, 'address/city')).toEqual('x');
    expect(readPropertyPath(entity, 'phones/0/number')).toEqual('1');
    expect(readPropertyPath(entity, 'phones/3/number')).toBeUndefined();
    expect(readPropertyPath(entity, 'address/city/name')).toBeUndefined();
  });

  test('write creates the objects and arrays on the way', () => {
    const target: Record<string, unknown> = {};

    writeToPropertyPath(target, 'address/city', 'y');
    writeToPropertyPath(target, 'phones/0/number', '2');

    expect(target).toEqual({
      address: { city: 'y' },
      phones: [{ number: '2' }]
    });
    expect(Array.isArray(target.phones)).toBe(true);
  });
});
