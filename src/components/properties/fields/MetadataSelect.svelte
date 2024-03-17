<script lang="ts">
    export let data: SelectFieldData;
</script>

<div>
    <div>{ data.key }</div>
    { #each data.options as option }
    <div class="option">{ option }</div>
    {/each }
</div>

<style>
.option {
    background-color: #222;
}
</style>