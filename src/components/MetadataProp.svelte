<script lang="ts">
  export let data: MV_PropData;
</script>

<template lang="pug">
  div { data.def.key }: { data.value || data.def.default }
</template>

<style lang="stylus">
  
</style>