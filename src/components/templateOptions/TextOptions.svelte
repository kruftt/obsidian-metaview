<script lang="ts">
  import store from 'src/old_store.svelte'
  let { template }: { template: MVTextDef } = $props();
</script>

<template lang="pug">
  div.mv-options-container
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="default") default:
      input(
        name="default"
        type="text"
        bind:value="{template.default}"
        on:change="{store.sync}"
      )
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="minlength") minlength:
      input(
        name="minlength"
        type="text"
        bind:value="{template.minlength}"
        on:change="{store.sync}"
      )
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="maxlength") maxlength:
      input(
        name="maxlength"
        type="text"
        bind:value="{template.maxlength}"
        on:change="{store.sync}"
      )
    div.mv-metadata-property-option
      div.mv-metadata-options-spacer
      label(for="pattern") pattern:
      input(
        name="pattern"
        type="text"
        bind:value="{template.pattern}"
        on:change="{store.sync}"
      )
</template>
