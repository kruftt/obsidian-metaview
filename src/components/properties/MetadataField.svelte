<script lang="ts">
  import Fields from './fields'
  export let data: FieldData;
  export let type: string | undefined;
</script>

<template lang="pug">
  svelte:component(this="{Fields[type || data.type]}" data="{data}")
</template>

<style lang="stylus">
  
</style>