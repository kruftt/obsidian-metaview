
import { SvelteSet } from 'svelte/reactivity'

class MyStore {
  data = $state.raw(new SvelteSet(['some', 'test', 'values']));

  public refresh() {
    this.data = new SvelteSet(['new', 'vs', 'tests!']);
  }
}

export default new MyStore();
