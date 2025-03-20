<script lang="ts">
  import { setProperty } from '../actions'
  export let address: string[];
  export let data: {
    def: MVTimeDef
    value: unknown
  };
</script>

<template lang="pug">
  div.container
    div {address.at(-1)}:
    input(
      type="time"
      value="{data.value}"
      on:change!="{(e) => setProperty(address, e.target.value)}"
    )  
</template>

<style scoped lang="sass">
  .container
    display: flex
  
  input
    margin-left: 1em
</style>