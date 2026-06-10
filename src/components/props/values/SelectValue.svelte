<script lang="ts">
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

<select class="dropdown" name={name} bind:value={value}>
  <option value="" disabled selected hidden>Select an option...</option>
  {#each options as option}
    <option value={option}>{option}</option>
  {/each}
</select>

<style lang="sass">
</style>