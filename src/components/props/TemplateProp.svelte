<script lang="ts">
  import { Menu, setIcon } from 'obsidian';
  import { onMount } from 'svelte';
  import options from '../options';
  import { blurOnEnter, getContextMenuCallback, getSetKeyCallback } from '../events';
  import { makePropTemplate } from 'utils';
  import { TYPE_ICONS } from 'const';
  
  let { context, key = "" } : {
    context: Record<string, MVPropDef>,
    key: string,
  } = $props();

  let template = $derived(context[key]);
  let Options = $derived(template && options[template.type as keyof typeof options] || null);
  
  let keyInput!: HTMLInputElement;

  let typeIcon!: HTMLElement;
  $effect(() => typeIcon && template && setIcon(typeIcon, TYPE_ICONS[template.type]));
  
  let expandedIcon!: HTMLElement;
  let expanded = $state(false);
  $effect(() => setIcon(expandedIcon, (key && expanded) ? 'chevron-down' : 'chevron-right'));

  let newIcon!: HTMLElement;
  onMount(() => { setIcon(newIcon, 'plus'); });
  
  const openContextMenu = getContextMenuCallback(context, key);
  const setKey = getSetKeyCallback(context, key);

  function changeTemplate(e: Event) {
    const type = (<HTMLSelectElement>e.target).value;
    context[key] = makePropTemplate({ type })!;
  }
</script>

<template lang="pug">
  div.metadata-template-property
    div.metadata-property
      div.metadata-property-key
        div.metadata-property-icon(
          bind:this="{expandedIcon}"
          style:display="{Options ? 'flex' : 'none'}"
          onclick="{() => expanded = !expanded}"
        )

        div.metadata-property-icon(
          bind:this="{typeIcon}"
          style:display="{key ? 'flex' : 'none'}"
          onclick="{openContextMenu}"
          oncontextmenu="{openContextMenu}"
        )

        div.metadata-property-icon(
          bind:this="{newIcon}"
          style:display="{key ? 'none' : 'flex'}"
          onclick!="{() => keyInput.focus()}"
        )
      
        input.metadata-property-key-input(
          value="{key}"
          bind:this="{keyInput}"
          onkeypress="{blurOnEnter}"
          onblur="{setKey}"
          placeholder="Add Property"
        )
      
      div.metadata-property-value
        +if("key")
          select.dropdown(value="{template.type}" onchange="{changeTemplate}")
            option(value="text") text
            option(value="boolean") boolean
            option(value="number") number
            option(value="select") select
            option(value="multi") multi-select
            option(value="link") link
            option(disabled) ------------
            option(value="date") date
            option(value="time") time
            option(value="datetime-local") datetime
            option(value="month") month
            option(disabled) ------------
            option(value="tuple") tuple
            option(value="array") array
            option(value="record") record
            option(value="map") map
            option(value="json") json
        
    +if('key && expanded')
      +startif('Options') 
        Options({template} this="{options[template.type]}")
      +else 
        div ((options))
      +endif

        //- remove If once options implemented
</template>

<style scoped lang="sass">
  .mv-metadata-options-spacer
    flex: 0 2 var(--size-4-4)

  * :global
    .mv-options-container
      display: flex
      flex-direction: column

    .mv-metadata-property-option
      display: flex
      margin-top: var(--size-4-1)
      font-size: var(--metadata-label-font-size)
      align-items: center
      gap: var(--size-4-2)

      label
        width: var(--size-4-16)
        text-align: right
        flex: 0 0 auto
      
      input
        flex: 1 1 auto
        min-width: 0    
</style>