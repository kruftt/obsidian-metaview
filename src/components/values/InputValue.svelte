<script lang="ts">
  let { context, key, template } : {
    context: FrontMatter,
    key: string, 
    template: MVPropDef,
  } = $props();

  let input!: HTMLInputElement;
  export const focus = () => input.focus();  
</script>


<script lang="ts">
  import { format } from 'path';
  import { setProperty } from '../actions'
	import moment from 'moment';
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



<script lang="ts">
  import { setProperty } from '../actions'
  export let address: string[];
  export let data: {
    def: MVDateTimeDef
    value: unknown
  };
</script>

<template lang="pug">
  input(
    type="checkbox"
    bind:checked="{ value }"
    bind:this="{input}"
  )
</template>


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



<template lang="pug">
  div.container
    div {address.at(-1)}:
    input(
      type="datetime-local"
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

<script lang="ts">
  import { setProperty } from '../actions'
  export let address: string[];
  export let data: {
    def: MVNumberDef
    value: unknown
  };
</script>

<template lang="pug">
  div.container
    div {address.at(-1)}: 
    input(
      type="number"
      value="{data.value}"
      on:change!="{(e) => setProperty(address, e.target.valueAsNumber)}"
    )
</template>
