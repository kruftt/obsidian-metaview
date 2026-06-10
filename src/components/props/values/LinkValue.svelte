<script lang="ts">
  import store from 'data/store.svelte'
  let {
    name,
    template,
    value = $bindable()
  } : {
    name?: string,
    template: MVLinkDef
    value: any,
  } = $props();

  if (!value) value = '';
  let target = template.target;
  const options = store.getNotesByType(target);
</script>

<select class="dropdown" name={name} bind:value={value}>
  <option value="" disabled selected hidden>Select an option...</option>
  {#each options as option}
    <option value={option}>{option}</option>
  {/each}
</select>

<style lang="sass">
</style>