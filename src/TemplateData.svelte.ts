import { SvelteSet } from 'svelte/reactivity'
import { arrayWrap, truthy } from './utils';
import { makePropTemplate } from './utils';

export default class TemplateData {
  public types: SvelteSet<string>;
  public aliases: SvelteSet<string>;
  public cssclasses: SvelteSet<string>;
  public tags: SvelteSet<string>;
  public props: Record<string, MVPropDef> = $state({});

  constructor(frontmatter: FrontMatter) {
    const { types, aliases, tags, cssclasses, ...props } = frontmatter;

    this.types = new SvelteSet(arrayWrap(types).filter(truthy));
    this.aliases = new SvelteSet(arrayWrap(aliases).filter(truthy));
    this.tags = new SvelteSet(arrayWrap(tags).filter(truthy));
    this.cssclasses = new SvelteSet(arrayWrap(cssclasses).filter(truthy));

    const p = this.props;
    for (let [k,v] of Object.entries(props)) {
      p[k] = makePropTemplate(v);
    }
  }
}
