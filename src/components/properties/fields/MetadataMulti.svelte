<script lang="ts">
  import { onMount, beforeUpdate } from 'svelte';
  import { updateField } from '../../../store'
  export let data: FieldData;

  let expanded = true;

  let selectionArray: MetadataSelectOption[];
  $: selectionArray = Object.values(data.options.valuesList).map((classname: string) => {
    return {
      name: classname,
      selected: (data.value as string[]).contains(classname),
    }
  });

  $: iconClass = 'tree-item-icon collapse-icon nav-folder-collapse-indicator' + (!expanded ? " is-collapsed" : "");
  const pillClass = (option: MetadataSelectOption) =>
    'pill' + (option.selected ? ' pill__selected' :(!expanded ? ' pill__hidden' : ''));

  function toggleOption(option: MetadataSelectOption) {
    option.selected = !option.selected;
    updateField(data.key, selectionArray.reduce((arr, option) => {
      option.selected && arr.push(option.name);
      return arr;
    }, [] as string[]));
  }
</script>

<template lang="pug">
  div(class='multi')
    div(class='multi__name-bar' on:click!='{() => (expanded = !expanded)}')
      div(class="{iconClass}")
        svg(xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon right-triangle")
          path(d="M3 8L12 17L21 8")
      span(class='multi__icon') {data.key}
      
    div(class="{'multi__list' + (!expanded ? ' multi__list--collapsed' : '')}")
      +each('selectionArray as option (option.name)')
        div(class="{'multi__pill-container' + (!expanded ? ' multi__pill-container--collapsed' : '')}" on:click!="{() => toggleOption(option)}")
          +if('expanded')
            input(type='checkbox' checked="{option.selected}" class='multi__checkbox')
          span(class="{'multi__pill' + (option.selected ? ' multi__pill--selected' :(!expanded ? ' multi__pill--hidden' : ''))}") {option.name}
          div(class='multi__pill-spacer')
</template>

<style lang="stylus">
  // .multi
    // padding: 0.8em
    // border-bottom: 1px solid var(--tab-outline-color)

  .multi__name-bar
    display: flex
    width: 100%
    gap: 0.2em
    align-items: center
    flex-flow: row nowrap
    height: 1.6em

  .multi__icon
    margin-right: 0.5em

  .multi__list
    font-size: 0.9em
    display: flex
    flex-flow: column nowrap
    gap: 0.2em
    
  .multi__list--collapsed
    flex-flow: row wrap

  .multi__pill-container
    display: flex
    width: 100%
    align-items: center
    &:hover
      background-color: var(--interactive-hover)

  .multi__pill-container--collapsed
    width: auto

  .multi__pill
    color: #bbb
    background-color: var(--background-secondary)
    border: 3px solid var(--background-secondary)
    border-radius: var(--font-smaller)
    font-size: var(--font-smaller)
    padding: 0 0.2em

  .multi__pill-spacer
    flex-grow: 1
  
  .multi__pill--selected
    background-color: var(--interactive-hover)
    border-color: var(--interactive-hover)

  .multi__pill--hidden
    display: none

  .multi__checkbox
    padding: 0
</style>