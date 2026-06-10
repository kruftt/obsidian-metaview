<script lang='ts'>
  import { on } from 'svelte/events'
  import { setIcon } from 'obsidian';
  import { blurOnSpace } from '../events';

  let { editable, entries, entry }: {
    editable: boolean
    entries: string[]
    entry: string
  } = $props();

  let editing: boolean = $state(false);

  function removeEntry(this: HTMLElement, e: InputEvent) {
    e.stopPropagation();
    entries.remove(entry);
  }

  function editEntry(this: HTMLDivElement, e: UIEvent) {
    const edit = (this.textContent || '').trim();
    const i = entries.indexOf(entry);
    if (edit && !entries.includes(edit)) {
      entries[i] = edit;
    } else {
      this.textContent = entries[i];
    }
    editing = false;
  }

  const startEdit = (e: UIEvent) => {
    e.stopPropagation();
    if (editable) editing = true;
  };

  function stopProp(el: HTMLElement) {
    on(el, 'click', (e: UIEvent) => {
      e.stopPropagation();
    });
  }
</script>

{#if editing}
  <div
    class="multi-select-input"
    tabindex="0"
    contenteditable
    use:stopProp
    onkeypress={blurOnSpace}
    onfocusout={editEntry}
  >{entry}</div>
{:else}
  <div class="multi-select-pill" tabindex="0">
    <div class="multi-select-pill-content" use:stopProp ondblclick={startEdit}>
      <span>{entry}</span>
    </div>
    <div class="multi-select-pill-remove-button" use:setIcon={'x'} onclick={removeEntry}></div>
  </div>
{/if}

<style lang='sass'>
  .multi-select-input
    background-color: var(--metadata-input-background-active)
    // border-radius: var(--input-radius)
    // margin: var(--size-4-1)
</style>