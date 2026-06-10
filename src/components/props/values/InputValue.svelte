<script lang="ts">
  import { blurOnEnter } from '../events';
  import store from 'data/store.svelte';
  
  let { name, template, value = $bindable() } : {
    name?: string,
    template: MVInputDef
    value: any,
  } = $props();
  
  let type = $derived(template.type); 
  let inputProps = $derived(template.props || {});

  function syncValue (e: Event) {
    const target = <HTMLInputElement>e.target;
    const valid = target.validity.valid;
    if (valid) {
      if (type === "number") value = parseFloat(target.value);
      else value = target.value;
      store.commit();
    }
  }
</script>

{#if type === "boolean"}
  <input type="checkbox" class="metadata-property-value-input"
    {name} bind:checked={value} onchange={() => store.commit()} {...inputProps}
    style:flex="0 0 auto"
  />
{:else}
  <input {type} class="metadata-property-value-input"
    {name} {value} {...inputProps}
    onkeypress={blurOnEnter}
    onblur={syncValue}
  />
{/if}

<style scoped lang="sass">
  input:invalid
    border: var(--size-2-1) solid var(--color-red) !important
    // background-color: var(--background-modifier-error)

  input[type="checkbox"]
    margin-left: var(--size-2-3)
</style>