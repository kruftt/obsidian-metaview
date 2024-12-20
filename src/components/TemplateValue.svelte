<script lang="ts">
  import { blurOnEnter } from './events';
  import { makePropTemplate } from 'src/utils';
  import store from 'src/store.svelte'
  import options from './templateOptions';

  let { template = $bindable() } : { template: MVPropDef } = $props();

  function changeTemplate(e: Event) {
    const type = (<HTMLSelectElement>e.target).value;
    template = makePropTemplate({ type });
    store.sync();
  }

  console.log(options);
  let Component = $derived(options[template.type as 'boolean'] || null);
</script>

<template lang="pug">
  div.metadata-property-value
    div
      select.dropdown(value="{template.type}" onchange="{changeTemplate}")
        option(value="json") json
        option(value="boolean") checkbox
        option(value="date") date
        option(value="datetime") datetime
        option(value="month") month
        option(value="link") link
        option(value="multi") multi
        option(value="number") number
        option(value="array") array
        option(value="record") record
        option(value="select") select
        option(value="string") string
        option(value="time") time
        option(value="tuple") tuple

      +if('Component')
        Component({template} this="{options[template.type]}")
        +else 
          div unimplemented options
      //- +if('options[template.type]')
      //-   svelte:element({template} this="{options[template.type]}")
      //-   +else 
      //-     div unimplemented options
</template>
