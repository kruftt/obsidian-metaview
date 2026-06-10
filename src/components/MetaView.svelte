<script lang="ts">
  import { setIcon } from 'obsidian';
  import { onMount } from 'svelte'

  import store from '../data/store.svelte';
  import TemplateData from 'data/TemplateData.svelte';
  import NoteData from 'data/NoteData.svelte';

  import FileProp from "./props/FileProp.svelte";
  import NoteProp from './props/NoteProp.svelte';
  import TemplateProp from './props/TemplateProp.svelte';
  import NewKey from './props/keys/NewKey.svelte';
  import createExpand from './expand.svelte';
  
  $effect(() => store.sync());

  let data = $derived(store.data);
  let filename = $derived(store.file ? store.file.name : '');
  const freeTemplate = { type: 'json', default: '' };
  const expand = createExpand();

  function addTemplateProp(key: string, target: HTMLInputElement) {
    data!.props[key] = { type: 'text' };
  }
</script>

<div class="metadata-container">
  {#if data !== null}
    <div class="mv-filename" onclick={expand.toggle}>
      <span class="metadata-property-icon" bind:this={expand.icon}></span>
      {filename}
    </div>

    <div class="mv-metadata-file-props">
      {#if expand.open}
        <FileProp key="aliases" context={data.fileProps} />
        <FileProp key="tags" context={data.fileProps} />
        <FileProp key="cssclasses" context={data.fileProps} />
        {#if data instanceof NoteData}
          <FileProp key="types" context={data} />
        {/if}
      {/if}
    </div>

    <div class="metadata-content">
      {#if data instanceof NoteData}
        {#each data.freeProps as key}
          <NoteProp {key} context={data.props} editable />
        {/each}
        <div class="metadata-property">
          <NewKey context={data.props} value="''" />
        </div>
        {#each Object.entries(data.typeData) as [name, typeData]}
          <div class="mv-properties-title">{name}</div>
          {#each Object.entries(typeData.props) as [key, template]}
            <NoteProp {key} {template} context={data.props} />
          {/each}
        {/each}
      {:else}
        {#each Object.keys(data.props) as key (key)}
          <TemplateProp {key} context={data.props} editable />
        {/each}
        <div class="metadata-property">
          <NewKey context={data.props} value={{ type: 'text' }} />
        </div>
      {/if}
    </div>
  {/if}
</div>

<style lang='sass'>
  .mv-filename
    display: flex
    align-items: center
    gap: var(--size-4-1)

    &:hover
      color: var(--text-normal)

  .mv-metadata-file-props
    padding-bottom: 0.4em
    margin-bottom: 0.6em
</style>
