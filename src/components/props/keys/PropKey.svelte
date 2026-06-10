<script lang='ts'>
  import { blurOnEnter } from '../events';
  
  let { context, editable, key } : {
    context: Record<string, any>
    editable?: boolean
    focus: (e: PointerEvent) => void
    key: string
  } = $props();

  const setKey = (e: Event) => {
    const target = <HTMLInputElement>e.target;
    const newKey = target.value;
    if (!newKey || newKey === key) return;
    if (newKey in context!) {
      target.value = key;
    } else {
      context![newKey] = context![key];
      delete context![key];
      key = newKey;
    }
  };
</script>

{#if context && editable}
  <input
    class="metadata-property-key-input"
    value={key}
    onkeypress={blurOnEnter}
    onblur={setKey}
    placeholder="PropKey"
  />
{:else}
  <div onclick={focus ? focus : ''}>{key}</div>
{/if}

<style lang='sass'>
</style>