<script lang="ts">
  import { setProperty } from '../actions'
  import { createEventDispatcher } from 'svelte'

  // Does an element ever need to know its key by itself?
  // Yes, to draw the key label
  // Either each component stores its address array
  // Or each component has a dispatcher

  // Probably technically cheaper to store address array

  // export let key: string;
  export let address: string[];
  export let value: unknown;
  export let template: MVJsonDef = { type: 'json' };

  const dispatch = createEventDispatcher<{
    update: { address: string[], value: unknown }
  }>();

  function onBlur(e: InputEvent) {
    const target = e.target;
    if (target instanceof HTMLElement) {
      // dispatch('update', {
      //   address: [key],
      //   value: target.innerText,
      // });
      setProperty(address, target.innerText);
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    e.stopPropagation();
    const target = e.target;
    if (target instanceof HTMLElement) {
      if (e.key === 'Enter') target.blur();
    }
  }
</script>

<template lang="pug">
  //- div.metadata-property
  //-   span.metadata-property-key {key}
  //-   div.metadata-property-value {value}
  div
    div
      b {address[address.length-1]}:
    div.value(contentEditable on:keydown="{onKeyDown}" on:blur="{onBlur}") {value}
</template>

<style lang="sass" scoped>
  .value
    user-select: text
    -webkit-user-select: text
  // .metadata-property-key 
  //   width: calc(var(--metadata-label-width) * 0.6)
  //   min-width: calc(var(--metadata-label-width) * 0.6)
</style>