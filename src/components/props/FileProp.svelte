<script lang="ts">
  import ListValue from './values/ListValue.svelte';
  import { setIcon } from 'obsidian';
	let { key, context }: { key: MVFilePropType, context: Record<string, string[]> } = $props();
  let input!: HTMLDivElement;
  import PropKey from './keys/PropKey.svelte';
</script>

<div class="metadata-property" data-property-key={key}>
  <div class="mv-file-key metadata-property-key">
    <PropKey {context} {key} />
  </div>
  <ListValue entries={context[key]} editable={true} />
</div>

<style scoped lang="sass">
  .mv-file-key
    align-items: center
    color: var(--metadata-label-text-color)
    font-size: var(--metadata-label-font-size)
    font-weight: var(--metadata-label-font-weight)
    height: var(--input-height)
    min-width: calc(var(--metadata-label-width) * 0.6)
    flex: 0 0 min-content !important
    padding-left: 0.5em

  .metadata-property
    --pill-padding-x: var(--tag-padding-x)
    --pill-padding-y: var(--tag-padding-y)

  .metadata-property[data-property-key="aliases"]
    --pill-background: rgba(var(--color-purple-rgb), 0.1)

  .metadata-property[data-property-key="cssclasses"]
    --pill-background: rgba(var(--color-yellow-rgb), 0.1)

  .metadata-property[data-property-key="types"]
    --pill-background: rgba(var(--color-green-rgb), 0.1)
</style>
