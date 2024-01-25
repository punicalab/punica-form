/**
 * Performs a deep copy of special types (Date, RegExp, Map, Set).
 * @param obj - The object to be copied.
 * @returns The deep copy of the object.
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
 * Performs a deep copy of a function.
 * @param func - The function to be copied.
 * @returns The deep copy of the function.
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
 * Performs a deep copy of an object.
 * @param obj - The object to be copied.
 * @returns The deep copy of the object.
 */
export const deepCopy = (obj: any): any => {
  //if (obj instanceof Function) {
  //  return deepCopyFunction(obj);
  //}

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
