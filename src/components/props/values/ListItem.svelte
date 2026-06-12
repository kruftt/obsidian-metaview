<script lang='ts'>
import { on } from "svelte/events";
import { setIcon } from "obsidian";
import { activateOnKey, blurOnEnter } from "../events";
import { getStore } from "data/store.svelte";

const store = getStore();

let {
	editable,
	entries,
	entry,
}: {
	editable: boolean;
	entries: string[];
	entry: string;
} = $props();

let editing: boolean = $state(false);

function removeEntry(this: HTMLElement, e: MouseEvent) {
	e.stopPropagation();
	entries.remove(entry);
	store.commit();
}

function editEntry(this: HTMLDivElement, _e: UIEvent) {
	const edit = (this.textContent || "").trim();
	const i = entries.indexOf(entry);
	if (edit && !entries.includes(edit)) {
		entries[i] = edit;
		store.commit();
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
	on(el, "click", (e: UIEvent) => {
		e.stopPropagation();
	});
}
</script>

{#if editing}
  <div
    class="multi-select-input"
    role="textbox"
    aria-label="Edit entry"
    tabindex="0"
    contenteditable
    use:stopProp
    onkeypress={blurOnEnter}
    onfocusout={editEntry}
  >{entry}</div>
{:else}
  <div class="multi-select-pill">
    <div
      class="multi-select-pill-content"
      role="button"
      tabindex="0"
      aria-label="Edit entry"
      use:stopProp
      ondblclick={startEdit}
      onkeydown={activateOnKey(startEdit)}
    >
      <span>{entry}</span>
    </div>
    <button
      type="button"
      class="multi-select-pill-remove-button mv-icon-button"
      aria-label="Remove entry"
      use:setIcon={'x'}
      onclick={removeEntry}
    ></button>
  </div>
{/if}

<style lang='sass'>
  .multi-select-input
    background-color: var(--metadata-input-background-active)
  
  .multi-select-pill
    padding: 0 6px
</style>