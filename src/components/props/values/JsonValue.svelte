<script lang="ts">
  import { blurOnEnter } from '../events';

  let { name, template, value = $bindable()} : {
    name: string
    template?: MVJsonDef | MVCollectionDef | MVSelectMultiDef
    value: any
  } = $props();
  
  let stringifiedValue = $derived(JSON.stringify(value || '').replace(/^"|"$/g, ''));
  let editable = $derived(!template || template.type === 'json');

  function updateValue(e: FocusEvent) {
    const target = <HTMLInputElement>e.target;
    const text = target.value;
    
    try {
      const newValue = JSON.parse(text);
      value = newValue;
    } catch (e) {
      if (e instanceof SyntaxError) {
        value = text;
      } else throw(e);
    }
    target.value = stringifiedValue;
  }
</script>

<template lang="pug">
  +startif("editable")
    input.metadata-property-value-input(
      value="{stringifiedValue}"
      onkeypress="{blurOnEnter}"
      onblur="{updateValue}"
      type="text"
    )
  +else
    div.mv-static-json {stringifiedValue}
  +endif
</template>

<style lang="sass" scoped>
  .mv-static-json
    color: var(--text-warning)
</style>