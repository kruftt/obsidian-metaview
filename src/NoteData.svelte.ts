import { SvelteSet } from "svelte/reactivity";
import type TemplateCache from "./TemplateCache.svelte";
import type TemplateData from "./TemplateData.svelte";
import { arrayWrap, truthy } from "./utils";

export default class NoteData {
  types: SvelteSet<string>;
  aliases: SvelteSet<string>;
  tags: SvelteSet<string>;
  cssclasses: SvelteSet<string>;
  props: FrontMatter = $state({});
  typeData: Record<string, TemplateData> = $state.raw({});
  freeProps: SvelteSet<string>;

  constructor(frontmatter: FrontMatter, cache: TemplateCache) {
    const { types, aliases, tags, cssclasses, ...props } = frontmatter;
    this.types = new SvelteSet(arrayWrap(types).filter(truthy));
    this.aliases = new SvelteSet(arrayWrap(aliases).filter(truthy));
    this.tags = new SvelteSet(arrayWrap(tags).filter(truthy));
    this.cssclasses = new SvelteSet(arrayWrap(cssclasses).filter(truthy));
    this.props = props;
    this.freeProps = new SvelteSet();
    this.updateTypeData(cache);
  }

  public updateTypeData(cache: TemplateCache) {
    const typeData: Record<string, TemplateData> = {};
    this.freeProps.clear();
    const freeProps = { ...this.props };
    const typeQueue: string[] = [...this.types].reverse();
    const completedTypes: Record<string, boolean> = {};
    let type: string | undefined;
    let templateData: TemplateData;

    while (type = typeQueue.pop()) {
      if (completedTypes[type]) continue;
      completedTypes[type] = true;
      templateData = cache.get(type);
      if (!templateData) continue;
      typeData[type] = templateData;
      typeQueue.push(...[...templateData.types].reverse());
      for (let propKey of Object.keys(templateData.props)) {
        delete freeProps[propKey];
      }
    }

    Object.keys(freeProps).forEach(this.freeProps.add, this.freeProps);
    this.typeData = typeData;
  }
}
