<script lang="ts">
  import { makePropTemplate } from 'src/utils';
  import store from 'src/old_store.svelte'

  let { template = $bindable() }: { template: MVPropDef } = $props();

  function changeTemplate(e: Event) {
    const type = (<HTMLSelectElement>e.target).value;
    template = makePropTemplate({ type })!;
    console.log(template);
    store.sync();
  }
</script>

<template lang="pug">
  select.dropdown(value="{template.type}" onchange="{changeTemplate}")
    option(value="json") json
    option(value="boolean") checkbox
    option(value="date") date
    option(value="datetime-local") datetime
    option(value="month") month
    option(value="link") link
    option(value="multi") multi
    option(value="number") number
    option(value="array") array
    option(value="record") record
    option(value="select") select
    option(value="text") text
    option(value="time") time
    option(value="tuple") tuple
</template>

<style lang="sass">
  select
    flex-grow: 1
    border: none
    &:focus
      box-shadow: none
</style>