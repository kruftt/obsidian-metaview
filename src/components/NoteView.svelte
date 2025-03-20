<script lang="ts">
  import FileProp from "./props/FileProp.svelte";
</script>

<template lang='pug'>
  d NoteView

  div.metadata-content
    div.mv-metadata-file-props
  //-     FileProp(key="aliases", entries="{data.aliases}")
  //-     FileProp(key="tags", entries="{data.tags}")
  //-     FileProp(key="types", entries="{data.types}")

  //- +each("data.freeProps as key")
  //-   NoteProp({key} context="{props}")
  //-   +each("Object.entries(data.typeData) as [name, typeData]")
  //-     div.metadata-properties-title {name}
  //-     +each("Object.entries(typeData.props) as [key, template]")
  //-       NoteProp({key} {template} context="{props}")
</template>
