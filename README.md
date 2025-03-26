# Obsidian - Metadata View

Work-in-progress Obsidian plugin to support structured metadata.  
Uses Svelte 5, Typescript, Pug, Sass.

#### Features

- Create data type templates and add them to files.
- Include multiple data templates in a single note file.
- Specify the name, type and constraints of metadata properties.
- Support for nested data types, including objects and arrays.
- Types include: text, number, boolean, date/time, link (can filter by data type), select, multiselect, array, tuple, map, record, etc.


#### Roadmap

- [x] Complete data backend for the plugin.
- [ ] Complete prop interface elements.
- [ ] Add initial version to Obsidian plugin store.


#### Future

- Add in-editor panel (in addition to the current sidebar)
- Ability to use templates' bodies in notes using a code block processor.
