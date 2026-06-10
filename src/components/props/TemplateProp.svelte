<script lang="ts">
  import { setIcon } from 'obsidian';
  import { blurOnEnter, createContextMenuCallback } from './events';
  import { makePropTemplate } from 'utils';
  import { PROPERTY_TYPES, TYPE_ICONS } from 'const';
  import PropKey from './keys/PropKey.svelte';
  import SelectValue from './values/SelectValue.svelte';
  import Configs from './configs';
  import createExpand from 'components/expand.svelte';
  
  let { context, key, editable = false, remove = () => delete context[key] } : {
    context: Record<string, MVPropDef>,
    key: string,
    editable?: boolean,
    remove?: () => void
  } = $props();

  let template = $derived(context[key]);
  
  let typeIcon!: HTMLElement;
  $effect(() => setIcon(typeIcon, TYPE_ICONS[template.type]));
  
  const expand = createExpand();
  const openContextMenu = createContextMenuCallback(remove);

  let selectedType = $state(template.type);
  let Config = $derived(Configs[template.type]);
  $effect(() => { if (selectedType !== template.type) context[key] = makePropTemplate({ type: selectedType })! });
</script>

<div class="mv-template-property">
  <div class="metadata-property">
    <div class="mv-icon-tray">
      <div class="metadata-property-icon" bind:this={expand.icon} onclick={expand.toggle}></div>
      <div
        class="metadata-property-icon"
        bind:this={typeIcon}
        style:display={key ? 'flex' : 'none'}
        onclick={openContextMenu}
        oncontextmenu={openContextMenu}
      ></div>
    </div>

    <div class="metadata-property-key">
      <PropKey {context} {key} {editable} />
    </div>

    <div class="metadata-property-value">
      <SelectValue bind:value={selectedType} options={PROPERTY_TYPES} />
    </div>
  </div>

  {#if expand.open}
    <Config {template} />
  {/if}
</div>

<style scoped lang="sass">
  .metadata-property
    padding: 1px 0

  .mv-template-property
    border-bottom: var(--border-width) solid var(--metadata-divider-color)
</style>