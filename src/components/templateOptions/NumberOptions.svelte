<script lang="ts">
  import store from 'src/old_store.svelte'
  let { template }: { template: MVBoolDef } = $props();
</script>

<template lang="pug">
  div.mv-options-container
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="default") default:
      input(
        name="default"
        type="number"
        bind:value="{template.default}"
        on:change="{store.sync}"
      )
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="min") min:
      input(
        name="min"
        type="number"
        bind:value="{template.min}"
        on:change="{store.sync}"
      )
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="max") max:
      input(
        name="max"
        type="number"
        bind:value="{template.max}"
        on:change="{store.sync}"
      )
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="step") step:
      input(
        name="step"
        type="number"
        bind:value="{template.step}"
        on:change="{store.sync}"
      )
</template>
