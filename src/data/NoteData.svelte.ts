import type { MVIndex } from './store.svelte';
import { arrayWrap, truthy } from "../utils";

export default class NoteData {
  props: FrontMatter = $state({});
  fileProps: Record<string, string[]> = $state({});
  types: string[] = $state([]);

  freeProps: Array<string> = $state([]);
  /** Resolved type chain → the props each type contributes (after override dedupe). */
  typeData: Record<string, Record<string, MVPropDef>> = $state.raw({});

  private readonly index: MVIndex;

  constructor(frontmatter: FrontMatter, typesProperty: string, index: MVIndex) {
    this.index = index;
    const { [typesProperty]: types, aliases, cssclasses, tags, ...props } = frontmatter;
    
    this.types = arrayWrap(types).filter(truthy);
    const fileProps = this.fileProps;
    fileProps.aliases = arrayWrap(aliases).filter(truthy);
    fileProps.cssclasses = arrayWrap(cssclasses).filter(truthy);
    fileProps.tags = arrayWrap(tags).filter(truthy);
    this.props = props;
    this.updateTypeData(typesProperty);
  }

  public updateTypeData(_typesProperty: string) {
    const typeData: Record<string, Record<string, MVPropDef>> = {};
    const freeProps = { ...this.props };

    delete freeProps.aliases;
    delete freeProps.cssclasses;
    delete freeProps.tags;

    const templates = this.index.templates;
    const seen = new Set<string>();      // guards against cycles / diamond repeats
    const claimed = new Set<string>();   // prop keys already provided by a more-derived type

    // Walk the type graph depth-first starting from the note's own types, so a derived type's
    // props take precedence over (and suppress) the same key declared by its ancestors.
    const queue = [...this.types].reverse();
    for (let type = queue.pop(); type !== undefined; type = queue.pop()) {
      if (seen.has(type)) continue;
      seen.add(type);
      const templateData = templates[type];
      if (!templateData) continue;

      const owned: Record<string, MVPropDef> = {};
      for (const [key, def] of Object.entries(templateData.props)) {
        if (claimed.has(key)) continue; // overridden by a more-derived type already processed
        claimed.add(key);
        owned[key] = def;
        delete freeProps[key];
      }
      if (Object.keys(owned).length > 0) typeData[type] = owned;

      // Enqueue parents, reversed so their declared order is preserved under the LIFO pop().
      queue.push(...[...templateData.types].reverse());
    }

    this.typeData = typeData;
    this.freeProps = Object.keys(freeProps);
  }
}
