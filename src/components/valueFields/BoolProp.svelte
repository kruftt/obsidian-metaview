<script lang="ts">
  import store from '../../store.svelte'
  
  let { state, address = [], key, def }: {
    state: { [key:string]: boolean }
    address: string[],
    key: string,
    def: MVBoolDef,
  } = $props();

  if (state[key] === undefined) {
    state[key] = def.checked || false;
  }
</script>

<template lang="pug">
  div.container
    div {address.at(-1)}:
    input(
      type="checkbox"
      bind:checked="{state[key]}"
      on:change!="{() => store.setProperty(address, state[key])}"
    )  
</template>

<style scoped lang="sass">
  .container
    display: flex
  
  input
    margin-left: 1em
</style>