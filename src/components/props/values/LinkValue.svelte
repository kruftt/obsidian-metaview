<script lang="ts">
import { Keymap } from "obsidian";
import { untrack } from "svelte";
import { getStore } from "data/store.svelte";
import { TextInputSuggest } from "TextInputSuggest";

const store = getStore();

let {
	template,
	value = $bindable(),
}: {
	template: MVLinkDef;
	value: FrontMatterValue;
} = $props();

let input = $state<HTMLDivElement>();
let editing = $state(false);
let target = $derived(template.target);

/** Link target stored in `value` (the path inside `[[ ]]`, sans `|alias`/`#heading`). */
let path = $derived.by(() => {
	if (typeof value !== "string") return "";
	const inner = value.match(/^\[\[(.*)\]\]$/)?.[1] ?? value;
	return inner.split(/[|#]/)[0].trim();
});
/** Short name shown for the link; the full path stays in `value` for correctness. */
let displayName = $derived(path.split("/").pop() ?? path);

/** Store the chosen note as a full-path wikilink so Obsidian renders a real link. */
function setLink(p: string) {
	value = p ? `[[${p}]]` : "";
	store.commit();
}

function follow(e: MouseEvent | KeyboardEvent) {
	store.app.workspace.openLinkText(
		path,
		store.file?.path ?? "",
		Keymap.isModEvent(e as MouseEvent),
	);
}

// Clicking the link itself follows it; clicking elsewhere in the field area
// (the container's onclick) drops into edit mode.
function onLinkClick(e: MouseEvent) {
	e.preventDefault();
	e.stopPropagation();
	follow(e);
}

// The input only exists while editing (or while the link is unset). Attach the
// note suggester to it, and when entering edit mode, focus + preselect the name.
$effect(() => {
	if (!input) return;
	const el = input;
	const suggest = new TextInputSuggest(
		store.app,
		el,
		(query) => {
			const q = query.toLowerCase();
			return store
				.getNotesByType(target)
				.filter((p) => p.toLowerCase().includes(q))
				.slice(0, 20);
		},
		(p) => {
			el.textContent = "";
			editing = false;
			setLink(p);
		},
	);
	if (untrack(() => editing)) {
		el.textContent = untrack(() => displayName);
		el.focus();
		const range = document.createRange();
		range.selectNodeContents(el);
		const sel = window.getSelection();
		sel?.removeAllRanges();
		sel?.addRange(range);
	}
	return () => suggest.close();
});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="metadata-property-value mv-link" onclick={() => (editing = true)}>
  {#if path && !editing}
    <a
      class="internal-link"
      href={path}
      data-href={path}
      onclick={onLinkClick}
    >{displayName}</a>
  {:else}
    <div
      class="mv-link-input"
      role="textbox"
      tabindex="0"
      aria-label="Edit link"
      contenteditable
      bind:this={input}
      onblur={() => (editing = false)}
    ></div>
  {/if}
</div>
