import { arrayWrap, truthy } from "../utils";
import type { MVIndex } from "./store.svelte";

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
		const {
			[typesProperty]: types,
			aliases,
			cssclasses,
			tags,
			...props
		} = frontmatter;

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
		const seen = new Set<string>(); // dedupe repeated type listings
		const claimed = new Set<string>(); // prop keys already provided by an earlier type

		// Composition: a note's effective schema is the union of its declared types' props.
		// No type graph — types are flat, and an earlier-listed type wins a key conflict.
		for (const type of this.types) {
			if (seen.has(type)) continue;
			seen.add(type);
			const templateData = templates[type];
			if (!templateData) continue;

			const owned: Record<string, MVPropDef> = {};
			for (const [key, def] of Object.entries(templateData.props)) {
				if (claimed.has(key)) continue; // already provided by an earlier-listed type
				claimed.add(key);
				owned[key] = def;
				delete freeProps[key];
			}
			if (Object.keys(owned).length > 0) typeData[type] = owned;
		}

		this.typeData = typeData;
		this.freeProps = Object.keys(freeProps);
	}
}
