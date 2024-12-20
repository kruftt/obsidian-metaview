<script lang="ts">
  import TemplateData from 'src/TemplateData.svelte';
  import store from '../store.svelte';
  import { blurOnEnter } from './events';
  import FileProp from './FileProp.svelte';
  // import MetaProp from './MetaProp.svelte';
  import TemplateValue from './TemplateValue.svelte';

  let data = $derived(store.data);
  let props = $derived(data ? data.props : null);

  const freeTemplate = { type: 'json', default: '' };

  function updateKey(e: FocusEvent) {
    const target = <HTMLInputElement>e.target;
    const key = target.dataset.key!;
    const newKey = target.value;
    if (newKey in props!) {
      target.value = key;
    } else {
      props![newKey] = props![key];
      delete props![key];
      store.sync();
    }
  }
</script>

<template lang='pug'>
  div.meta-view      
    +startif('data === null')
      div (No file)

    +else
      FileProp(key="aliases", entries="{data.aliases}")
      FileProp(key="tags", entries="{data.tags}")
      FileProp(key="types", entries="{data.types}")

      +startif("data instanceof TemplateData")
        +each("Object.keys(props) as key (key)")
          div.metadata-property
            div.metadata-property-key
              input.metadata-property-key-input(
                value="{key}"
                data-key="{key}"
                onkeypress="{blurOnEnter}"
                onblur="{updateKey}"
              )
            TemplateValue(bind:template="{props[key]}")
        
      //- +else
      //-   +each("data.freeProps as key")
      //-     MetaProp({key} {props} template="{freeTemplate}")

      //-   +each("Object.entries(data.typeData) as [name, typeData]")
      //-     div.type-header {name}

      //-     +each("Object.entries(typeData.props) as [key, template]")
      //-       MetaProp({key} {props} {template})

      +endif
    +endif
</template>

<style lang='sass' scoped>
  // :global(.view-content:has(> div.meta-view))
  //   padding: 0

  .meta-view 
    padding: 0.2em 0.2em 0.2em 0.4em

  .type-header
    margin-top: 0.8em
    font-weight: 600 
</style>