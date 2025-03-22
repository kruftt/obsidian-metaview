<script lang="ts">
  import { Menu, setIcon } from 'obsidian';
  import { onMount } from 'svelte';
  import options from '../options';
  import { blurOnEnter } from '../events';
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
  
  let contextIcon!: HTMLElement;
  let expanded = $state(false);
  $effect(() => setIcon(contextIcon, (key && expanded) ? 'chevron-down' : 'chevron-right'));

  let plusIcon!: HTMLElement;
  onMount(() => { setIcon(plusIcon, 'plus'); });
  // $effect(() => (key.length > 0 && plusIcon) ? undefined : setIcon(plusIcon, 'plus'));
  
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
    // console.log(template);
    // store.sync();
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
        div.metadata-property-icon(
          bind:this="{contextIcon}"
          style:display="{Options ? 'flex' : 'none'}"
          onclick="{onContext}"
        )

        div.metadata-property-icon(
          bind:this="{typeIcon}"
          style:display="{key ? 'flex' : 'none'}"
          onclick="{openContextMenu}"
          oncontextmenu="{openContextMenu}"
        )

        div.metadata-property-icon(
          bind:this="{plusIcon}"
          style:display="{key ? 'none' : 'flex'}"
          onclick!="{() => keyInput.focus()}"
        )
      
        input.metadata-property-key-input.mv-property-key-input(
          value="{key}"
          bind:this="{keyInput}"
          onkeypress="{blurOnEnter}"
          onblur="{updateKey}"
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

<style lang="sass">
  .metadata-template-property
    padding: var(--size-4-1) 0
    // border-top: var(--border-width) solid var(--metadata-divider-color)

  .mv-property-key-input
    margin-left: 4px

  select
    flex-grow: 1
    border: none
    &:focus
      box-shadow: none
</style>