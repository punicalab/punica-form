/**
 *
 * @param obj
 * @returns
 */
export const deepCopySpecialTypes = (obj: any): any => {
  if (obj instanceof Date) {
    return new Date(obj.valueOf());
  }

  if (obj instanceof RegExp) {
    const pattern = obj.valueOf().toString();
    const flags = pattern.substring(pattern.lastIndexOf('/') + 1);
    const realPattern = pattern.substring(1, pattern.lastIndexOf('/'));

    return new RegExp(realPattern, flags);
  }

  if (obj instanceof Map) {
    const mapCopy = new Map();

    obj.forEach((v, k) => {
      mapCopy.set(k, v);
    });

    return mapCopy;
  }
  if (obj instanceof Set) {
    const setCopy = new Set();

    obj.forEach((v) => {
      setCopy.add(v);
    });

    return setCopy;
  }
};

/**
 *
 * @param func
 * @returns
 */
export const deepCopyFunction = (func: Function) => {
  const funcStr = func.toString();

  if (func.prototype) {
    const paramArr = funcStr.match(/\((.*?)\)/)[1].split(', ');
    const funcBody = funcStr.match(/\{([\s\S]*)\}/)[1];
    const funcCopy = new Function(...paramArr, funcBody);

    funcCopy.prototype = Object.assign({}, func.prototype);

    return funcCopy;
  } else {
    return eval(funcStr);
  }
};

/**
 *
 * @param obj
 * @returns
 */
export const deepCopy = (obj: any): any => {
  if (obj instanceof Function) {
    return deepCopyFunction(obj);
  }

  if (
    obj instanceof Date ||
    obj instanceof RegExp ||
    obj instanceof Map ||
    obj instanceof Set
  ) {
    return deepCopySpecialTypes(obj);
  }

  if (obj instanceof Array) {
    return obj.map(deepCopy);
  }

  if (obj instanceof Object) {
    const copy = {};
    Object.keys(obj).forEach((key: string) => {
      //@ts-ignore
      copy[key] = deepCopy(obj[key]);
    });
    return copy;
  }

  return obj;
};
