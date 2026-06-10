<script lang='ts'>
  import { blurOnSpace } from '../events';
  import ListItem from './ListItem.svelte';
  import { getStore } from 'data/store.svelte';

  const store = getStore();

	let { editable, entries }: {
    editable: boolean
    entries: string[]
  } = $props();
  
  let input!: HTMLDivElement;
  
  function createEntry(this: HTMLDivElement, e: UIEvent) {
    const entry = (this.textContent || '').trim();
    if (entry && !entries.includes(entry)) {
      entries.push(entry);
      this.textContent = '';
      store.commit();
    }
  }
</script>

<div class="metadata-property-value">
  <div class="multi-select-container" onclick={() => { input.focus(); console.log('focus'); }}>
    {#each entries as entry, i}
      <ListItem {entry} {editable} {entries} />
    {/each}
    <div
      class="multi-select-input"
      contenteditable
      bind:this={input}
      onkeypress={blurOnSpace}
      onblur={createEntry}
    ></div>
  </div>
</div>