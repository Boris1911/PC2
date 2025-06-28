import { boot } from 'quasar/wrappers';

export default boot(() => {
  if (typeof window !== 'undefined' && window.$q) {
    window.$q.dark.set(false);
  }
});
