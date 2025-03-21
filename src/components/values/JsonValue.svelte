<script lang="ts">
  import { blurOnEnter } from '../events';

  let { value = $bindable() } : { value: any } = $props();
  
  let stringifiedValue = $derived(JSON.stringify(value).replace(/^"|"$/g, ''));
  
  function updateValue(e: FocusEvent) {
    console.log("updating value");
    const target = <HTMLInputElement>e.target;
    const innerText = target.innerText;
    
    try {
      const newValue = JSON.parse(innerText);
      value = newValue;
    } catch (e) {
      if (e instanceof SyntaxError) {
        value = innerText;
      } else throw(e);
    }
    target.innerText = stringifiedValue;
  }
</script>


<template lang="pug">
  input.metadata-property-value-input(
    value="{stringifiedValue}"
    onkeypress="{blurOnEnter}"
    onblur="{updateValue}"
  )

  //- bind:this="{input}"
  //- div.metadata-property-value-input(
  //-   contentEditable
  //-   onkeypress="{blurOnEnter}"
  //-   onblur="{updateValue}"
  //- ) { stringifiedValue }
    
</template>

<style lang="sass" scoped>

</style>