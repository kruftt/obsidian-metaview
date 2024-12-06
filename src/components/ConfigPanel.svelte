<script lang="ts">
  import ConfigProp from "./ConfigProp.svelte";
  let { data }: { data: MVTypeData } = $props();
</script>

<template lang="pug">
  div
    div config panel

    +each ("Object.entries(data.defs) as [key, def]")
      ConfigProp(address="{key}", {key}, {def})
    
    //- free props as JSONProps?
    //- Config props
    //- dropdown selects type
      //- 
</template>

<style lang="sass">
</style>