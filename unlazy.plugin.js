import { createFilter } from 'rollup-pluginutils';
import unlazyLoader from 'unlazy-loader';

export default function unlazy(options = {}) {
  const filter = createFilter(options.include, options.exclude);
  return {
    name: 'unlazy',
    transform(source, id) {
      if (!filter(id)) return null;
      const res = unlazyLoader(source);
      if (res === source) return;
      return res;
    }
  };
}
