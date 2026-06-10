<script lang="ts">
  import { getStore } from 'data/store.svelte';

  const store = getStore();

  let {
    name,
    options,
    template,
    value = $bindable(),
  } : {
    name?: string
    options?: string[]
    template?: MVSelectDef
    value: any,
  } = $props();

  if (!options) options = template?.options || [];
  if (!value) value = '';
</script>

<select class="dropdown" name={name} bind:value={value} onchange={() => store.commit()}>
  <option value="" disabled selected hidden>Select an option...</option>
  {#each options as option}
    <option value={option}>{option}</option>
  {/each}
</select>

<style lang="sass">
</style>