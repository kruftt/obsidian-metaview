import { arrayWrap, truthy } from '../utils';
import { makePropTemplate } from '../utils';

export default class TemplateData {
  public props: Record<string, MVPropDef> = $state({});
  public types: string[] = $state([]);
  public fileProps: Record<string, string[]> = $state({});
  
  constructor(frontmatter: FrontMatter, typesProperty: string) {
    const { [typesProperty]: types, ...props } = frontmatter;

    this.types = [...arrayWrap(types).filter(truthy)];
    
    const p = this.props;
    for (let [k,v] of Object.entries(props)) {
      const template = makePropTemplate(v);
      if (template) p[k] = template;
    }
    
    const fileProps = this.fileProps;
    fileProps.aliases = arrayWrap(props.aliases).filter(truthy);
    fileProps.cssclasses = arrayWrap(props.cssclasses).filter(truthy);
    fileProps.tags = arrayWrap(props.tags).filter(truthy);
  }
}
