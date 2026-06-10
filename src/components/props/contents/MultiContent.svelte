<script lang='ts'>
  import { getStore } from 'data/store.svelte';

  const store = getStore();

  let { data = $bindable(), template } : {
    data: unknown
    template: MVSelectMultiDef
  } = $props();

  if (!(data instanceof Array)) data = [];

  function toggleSelected (this: HTMLOptionElement, e: Event) {
    e.preventDefault();
    const value = this.value;
    const selected = this.selected = !this.selected;
    if (selected) {
      ;(<string[]>data).push(value);
    } else {
      const index = (<string[]>data).indexOf(value);
      if (index !== -1) (<string[]>data).splice(index, 1);
    }
    store.commit();
  };
</script>

<div class="mv-content-container">
  <select class="multi" bind:value={data} multiple>
    <option value="" disabled selected hidden>Select an option...</option>
    {#each template.options as option}
      <option onmousedown={toggleSelected} value={option}>{option}</option>
    {/each}
  </select>
</div>

<style lang='sass'>
  .multi
    height: auto
    width: 100%
    box-shadow: none
    background: transparent
    padding-bottom: var(--size-4-2)

    &:focus
      
      option:checked
        background-color: var(--metadata-input-background-active) !important
      
</style>