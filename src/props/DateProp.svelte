<script lang="ts">
  import { moment } from 'obsidian';
  import { format } from 'path';
  import { setProperty } from '../actions'
  export let address: string[];
  export let data: {
    def: MVDateDef
    value: unknown
  };

  function onChange(e: Event) {
    const fmt = data.def.format;
    setProperty(
        address,
        fmt
          ? moment((<HTMLInputElement>e.target).value).format(fmt)
          : (<HTMLInputElement>e.target).value
      );
  }
  //- on:change!="{(e) => setProperty(address, e.target.value)}"
</script>

<template lang="pug">
  div.container
    div {address.at(-1)}:
    input(
      type="date"
      value="{data.value}"
      on:change="{onChange}"
    )  
</template>

<style scoped lang="sass">
  .container
    display: flex
  
  input
    margin-left: 1em
</style>