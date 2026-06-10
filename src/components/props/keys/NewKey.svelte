<script lang='ts'>
  import { blurOnEnter } from '../events';
  import { getStore } from 'data/store.svelte';

  const store = getStore();


  let { context, value } : {
    context: Record<string, any>
    value: any
  } = $props();

  const setKey = (e: Event) => {
    const target = <HTMLInputElement>e.target;
    const newKey = target.value;
    if (!newKey) return;
    if (!(newKey in context)) {
      context[newKey] = value;
      store.commit();
    }
    target.value = '';
  };
</script>

<input
  class="metadata-property-key-input"
  onkeypress={blurOnEnter}
  onblur={setKey}
  placeholder="Add Property"
/>

<style lang='sass'>
</style>