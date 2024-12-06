<script lang="ts">
  import configs from './configs'
  let {key, address, def}:
      { key: string, address: string, def: MVPropDef } = $props();
</script>

<template lang="pug">
  div.container
    div {key}:
    //- select(name="propType" bind:value="{config.type}")
    select(name="propType" )
      option(value="boolean") boolean
      option(value="json") json
      option(value="date") date
      option(value="datetime") datetime
      option(value="month") month
      option(value="link") link
      option(value="multi") multi
      option(value="number") number
      option(value="array") array
      option(value="record") record
      option(value="select") select
      option(value="string") string
      option(value="time") time
      option(value="tuple") tuple
    
    //- +if ('config.type')
    //-   svelte:element(this=configs[config.type], {address}, {config})
</template>

<style scoped lang="sass">
  .container
    display: flex
  
  input
    margin-left: 1em
</style>