<script lang="ts">
  let { data }: { data: MVNoteData } = $props();
</script>

<template lang="pug">
  div
    +each('Object.entries(data.props) as [key, value]')
      JsonProp(address="{key}", {key}, {value})
</template>

<style lang="sass">
</style>