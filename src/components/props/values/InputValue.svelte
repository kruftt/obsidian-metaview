<script lang="ts">
  import { blurOnEnter } from '../events';
  
  let { name, type, value = $bindable() } : {
    name?: string,
    type: MVInputDef["type"],
    value: string,
  } = $props();
</script>

<template lang="pug">
  +startif('type === "boolean"')
    input.metadata-property-value-input(
      {name}
      type="checkbox"
      bind:checked="{value}"
      style:flex="0 0 auto"
    )
  +else
    input.metadata-property-value-input(
      {name}
      {type}
      {value}
      onkeypress="{blurOnEnter}"
      onblur!="{(e) => value = e.target.value }"
    )
  +endif
</template>

<style scoped lang="sass">
</style>
