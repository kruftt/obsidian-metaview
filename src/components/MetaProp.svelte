<script lang="ts">
  import { makePropTemplate } from 'src/utils';
  import { blurOnEnter } from './events';
  import store from 'src/store.svelte'
  import fields from './valueFields'
  import options from './templateOptions';

  let { address = [], key, props, template } : {
        address: string[],
        key: string,
        props: Record<string, FrontMatterValue | MVPropDef>,
        template: MVPropDef
      } = $props();

  let data = $derived(props[key]);

  function updateKey(e: FocusEvent) {
    const target = <HTMLInputElement>e.target;
    const newKey = target.value;
    if (newKey in props) {
      target.value = key;
    } else {
      props[newKey] = props[key];
      delete props[key];
      store.moveKey(key, newKey, address);
    }
  }

  function updateValue(value: FrontMatterValue | MVPropDef) {
    props[key] = value;
    store.setProperty(address, value);
  }

  function changeTemplate(e: Event) {
    const type = (<HTMLSelectElement>e.target).value;
    const template = makePropTemplate({ type });
    props[key] = template;
    store.setProperty(key, template, address);
  }


</script>

<template lang="pug">
  div.metadata-property
    div.metadata-property-key
      input.metadata-property-key-input(
        value="{key}"
        onkeypress="{blurOnEnter}"
        onblur="{updateKey}"
      )

    div.metadata-property-value
      +if("template == undefined")
        select.dropdown(value="{data.type}" onchange="{changeTemplate}")
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

        +if('options[data.type]')
          svelte:element({address} {data} this=options[data.type])
          +else
            div unimplemented options


        +else
          div {props[key]}
          //- svelte:element({address} {template} {data} this=fields[template.type])


</template>

<style scoped lang="sass">
</style>