import { arrayWrap, makePropTemplate, truthy } from "../utils";

export default class TemplateData {
	public props: Record<string, MVPropDef> = $state({});
	public types: string[] = $state([]);
	public fileProps: Record<string, string[]> = $state({});
	/** Frontmatter entries we can't model as prop defs, kept verbatim so writes
	 *  don't silently drop them (they just aren't shown in the template editor). */
	public passthrough: FrontMatter = {};

	constructor(frontmatter: FrontMatter, typesProperty: string) {
		const { [typesProperty]: types, ...props } = frontmatter;

		this.types = [...arrayWrap(types).filter(truthy)];

		const p = this.props;
		const passthrough = this.passthrough;
		for (const [k, v] of Object.entries(props)) {
			// aliases/cssclasses/tags are managed as fileProps below, not prop defs.
			if (k === "aliases" || k === "cssclasses" || k === "tags") continue;
			const template = makePropTemplate(v);
			if (template) p[k] = template;
			else passthrough[k] = v; // unmodeled — preserve as-is
		}

		const fileProps = this.fileProps;
		fileProps.aliases = arrayWrap(props.aliases).filter(truthy);
		fileProps.cssclasses = arrayWrap(props.cssclasses).filter(truthy);
		fileProps.tags = arrayWrap(props.tags).filter(truthy);
	}
}
