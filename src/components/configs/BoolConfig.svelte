<script lang="ts">
  import store from '../../oldstore.svelte'

  let { address, key, config }: {
    address: string,
    key: string,
    config: MVBoolDef
  } = $props();
</script>

<template lang="pug">
  div.container
    input(
      type="checkbox"
      bind:checked="{config.checked}"
      on:change!="{(e) => store.setProperty(address, config.checked) }"
    ) 
</template>

<style scoped lang="sass">
  .container
    display: flex
  
  input
    margin-left: 1em
</style>