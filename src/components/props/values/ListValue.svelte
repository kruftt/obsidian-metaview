<script lang='ts'>
import { blurOnEnter } from "../events";
import ListItem from "./ListItem.svelte";
import { getStore } from "data/store.svelte";
import { TextInputSuggest } from "TextInputSuggest";

const store = getStore();

let {
	editable,
	entries,
	suggestions,
	onAdd,
}: {
	editable: boolean;
	entries: string[];
	/** Optional autocomplete: maps the current query (+ already-used entries to
	 *  exclude) to a list of candidate completions. Omit for plain free text. */
	suggestions?: (query: string, exclude: string[]) => string[];
	/** Fired after an entry is added, before commit (e.g. to seed related entries). */
	onAdd?: (entry: string) => void;
} = $props();

let input!: HTMLDivElement;

function addEntry(entry: string) {
	entry = entry.trim();
	if (entry && !entries.includes(entry)) {
		entries.push(entry);
		onAdd?.(entry);
		store.commit();
	}
	input.textContent = "";
}

function createEntry(e: FocusEvent) {
	addEntry((e.currentTarget as HTMLDivElement).textContent || "");
}

// Wire Obsidian's native input-suggest popover to the entry input (tags, etc.).
$effect(() => {
	if (!suggestions || !input) return;
	const suggest = new TextInputSuggest(
		store.app,
		input,
		(query) => suggestions(query, entries),
		(value) => addEntry(value),
	);
	return () => suggest.close();
});
</script>

<div class="metadata-property-value">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="multi-select-container"
    onclick={() => input.focus()}
  >
    {#each entries as entry, i}
      <ListItem {entry} {editable} {entries} />
    {/each}
    <div
      class="multi-select-input"
      role="textbox"
      tabindex="0"
      aria-label="Add entry"
      contenteditable
      bind:this={input}
      onkeypress={blurOnEnter}
      onblur={createEntry}
    ></div>
  </div>
</div>
