<script lang="ts">
  export let data: InlineLinkData;
  export let backlink: boolean = false;
</script>

<template lang="pug">
  div 
    b(class="field_key") {data.line}:
    |  {data.displayText}
</template>


<style lang="stylus">
  .field_key
    color: #FF0
</style>