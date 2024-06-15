<script lang="ts">
  export let data: MDV_Prop;
</script>

<template lang="pug">
  div { data.key }: { data.value || data.default }
</template>

<style lang="stylus">
  
</style>