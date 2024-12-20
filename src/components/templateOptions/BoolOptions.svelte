<script lang="ts">
  import store from 'src/store.svelte'
  let { template }: { template: MVBoolDef } = $props();
</script>

<template lang="pug">
  div.metadata-property-row
    div default:
    input(
      type="checkbox"
      bind:checked="{template.default}"
      on:change="{store.sync}"
    )
</template>

<style scoped lang="sass">
  .metadata-property-row
    display: flex
    gap: 1em
</style>