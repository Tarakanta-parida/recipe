/**
 * Polyfills for Node.js 18.17.1 to support ES2023 Array methods required by Next.js 15
 */
if (!Array.prototype.toSorted) {
  Array.prototype.toSorted = function(compareFn) {
    return [...this].sort(compareFn);
  };
}

if (!Array.prototype.toReversed) {
  Array.prototype.toReversed = function() {
    return [...this].reverse();
  };
}

if (!Array.prototype.toSpliced) {
  Array.prototype.toSpliced = function(start, deleteCount, ...items) {
    const copy = [...this];
    copy.splice(start, deleteCount, ...items);
    return copy;
  };
}

if (!Array.prototype.with) {
  Array.prototype.with = function(index, value) {
    const copy = [...this];
    const actualIndex = index < 0 ? this.length + index : index;
    if (actualIndex < 0 || actualIndex >= this.length) {
      throw new RangeError("Invalid index");
    }
    copy[actualIndex] = value;
    return copy;
  };
}
