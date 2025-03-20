<script lang="ts">
  import { Menu, setIcon } from 'obsidian';
  import options from '../options';
  import { blurOnEnter } from '../events';
  import { makePropTemplate } from 'utils';
  import { TYPE_ICONS } from 'const';
  import TemplateSelector from './TemplateSelector.svelte';

  let { context, key = "", container = "free" } : {
    context: Record<string, MVPropDef>,
    key: string,
    container: MVContainerType,
  } = $props();

  let template = $derived(context[key]);
  let Options = $derived(options[template.type as keyof typeof options] || null);
  
  let keyInput!: HTMLInputElement;

  let typeIcon!: HTMLElement;
  $effect(() => typeIcon && setIcon(typeIcon, TYPE_ICONS[template.type]));
  
  let contextIcon!: HTMLElement;
  let expanded = $state(true);
  $effect(() => setIcon(contextIcon, key ? expanded ? 'chevron-down' : 'chevron-right' : 'plus'));
  
  function openContextMenu(e: MouseEvent) {
    const menu = new Menu();
    
    // menu.addItem((item) => { item
    //     .setTitle('Property type')
    //     // .setIcon(TYPE_ICONS[template.type])
    //     .setIcon('menu')
    //     .setSection('type');
    //   const submenu: Menu = item.setSubmenu();
    //   for (let type of Object.keys(options)) {
    //     submenu.addItem((i) => i
    //       .setTitle(type)
    //       .setIcon(TYPE_ICONS[type])
    //       .onClick(() => {
    //         context[key] = makePropTemplate({ type });
    //         store.sync();
    //       })
    //     );
    //   }
    // })
    // menu.addSeparator();

    menu.addItem((item) => item
        .setTitle('Remove')
        .setIcon('trash-2')
        .setSection('danger')
        .setWarning(true)
        .onClick(() => {
          delete context[key];
        })
      )
      .showAtMouseEvent(e);
  }

  function updateKey(e: FocusEvent) {
    const target = <HTMLInputElement>e.target;
    const newKey = target.value;
    if (newKey in context) {
      // temporary red outline / shake
      target.value = key;
    } else {
      context[newKey] = template || makePropTemplate({ type: 'text' });
      target.value = '';
      delete context[key];
    }
  }

  function changeTemplate(e: Event) {
    const type = (<HTMLSelectElement>e.target).value;
    context[key] = makePropTemplate({ type })!;
  }

  function onContext(e: Event) {
    if (key) expanded = !expanded
    else keyInput.focus();
  }
</script>

<template lang="pug">
  div.metadata-template-property
    div.metadata-property
      div.metadata-property-key
        span.metadata-property-icon(
          bind:this="{contextIcon}"
          onclick="{onContext}"
          oncontextmenu="{openContextMenu}"
        )
        +if("key")
          span.metadata-property-icon(bind:this="{typeIcon}" oncontextmenu="{openContextMenu}")
      
        input.metadata-property-key-input(
          value="{key}"
          bind:this="{keyInput}"
          onkeypress="{blurOnEnter}"
          onblur="{updateKey}"
          placeholder="Add Property"
        )
      
      div.metadata-property-value
        +if("key")
          TemplateSelector(bind:template="{context[key]}")
        
    +if('key && expanded')
      +if('Options') 
        Options({template} this="{options[template.type]}")
        +else 
          div ((options))

        //- remove If once options implemented
</template>

<style lang="sass">
  .metadata-template-property
    padding: var(--size-4-1) 0
    border-top: 1px solid var(--metadata-divider-color)
</style>