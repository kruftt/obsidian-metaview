<script lang="ts">
  import store from 'src/store.svelte'

  let { address, key, state, template = { type: 'json', default: '' }}: {
    address: string[],
    key: string,
    state: Record<string, FrontMatterValue>,
    template: MVJsonDef
  } = $props();

  let input: HTMLDivElement;
  
  function toggleProp() {
    if (state[key]) {
      delete state[key];
      store.setProperty(key, null, address);
    } else {
      const value = template.default;
      state[key] = value;
      store.setProperty(key, value, address);
    }
  }

  function changeProp() {
    const value = input.textContent || '';
    state[key] = value;
    store.setProperty(key, value, address);
  }

  function submitOnEnter(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      ;(<HTMLDivElement>e.target).blur();
    }
  }
</script>

<template lang="pug">
  div.container
    div.label {key}
    div.value(
      contentEditable
      bind:this="{input}"
      onkeypress="{submitOnEnter}"
      onblur="{changeProp}"
    ) {state[key]}
    div.addOrRemove(onclick="{toggleProp}") { state[key] ? '-' : '+' }
</template>

<style lang="sass" scoped>
  .container
    display: flex

  .label
    color: #AAA
    min-width: 5em

  .value
    margin-left: 1em
    background-color: #222
    flex: 1
    padding-left: 0.2em
    user-select: text
    -webkit-user-select: text

  .addOrRemove
    margin: 0 0.6em
</style>