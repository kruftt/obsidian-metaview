import { arrayWrap, truthy } from './utils';
import { makePropTemplate } from './utils';

export default class TemplateData {
  public props: Record<string, MVPropDef> = $state({});
  public types: string[] = $state([]);

  constructor(frontmatter: FrontMatter, typesProperty: string) {
    const { [typesProperty]: types, ...props } = frontmatter;

    this.types.push(...arrayWrap(types).filter(truthy));
    
    const p = this.props;
    for (let [k,v] of Object.entries(props)) {
      const template = makePropTemplate(v);
      if (template) p[k] = template;
    }
  }
}
