import type MetaViewPlugin from "Plugin";
import * as CONST from "const";
import {
	type App,
	type Debouncer,
	debounce,
	TFile,
	Vault,
	type WorkspaceLeaf,
} from "obsidian";
import { getContext, setContext } from "svelte";
import { arrayWrap, stableStringify } from "../utils";
import NoteData from "./NoteData.svelte";
import TemplateData from "./TemplateData.svelte";

const STORE_KEY = Symbol("mv-store");

/** Provide the active session to the component subtree (call in the root view component). */
export function setStore(store: MVSession): void {
	setContext(STORE_KEY, store);
}

/** Retrieve the session provided by an ancestor (call during component init). */
export function getStore(): MVSession {
	return getContext(STORE_KEY) as MVSession;
}

/**
 * Vault-wide note/template index. One instance per plugin, shared by every view. Holds the
 * data that is genuinely global (which notes exist, by type, and the parsed templates).
 */
export class MVIndex {
	public notes: Record<string, Array<TFile>>;
	public templates: Record<string, TemplateData>;

	private readonly plugin: MetaViewPlugin;
	private templateNameRegex: RegExp;

	constructor(plugin: MetaViewPlugin) {
		this.plugin = plugin;
		this.templateNameRegex = this.buildTemplateNameRegex();
		this.notes = {};
		this.templates = {};
	}

	private buildTemplateNameRegex(): RegExp {
		return new RegExp(
			`^${this.plugin.settings.templatesPath}${CONST.TEMPLATE_NAME_REGEX}`,
		);
	}

	/** Rebuild the note/template index by scanning the vault. Safe to call once the vault is ready. */
	public scan() {
		const templatesPath = this.plugin.settings.templatesPath;
		this.templateNameRegex = this.buildTemplateNameRegex();
		this.notes = {};
		this.templates = {};

		Vault.recurseChildren(this.plugin.app.vault.getRoot(), (file) => {
			if (file instanceof TFile) {
				if (file.path.startsWith(templatesPath)) {
					this.addTemplate(file);
				} else {
					this.addNote(file);
				}
			}
		});
	}

	public isTemplate(path: string): boolean {
		return path.startsWith(this.plugin.settings.templatesPath);
	}

	public addNote(file: TFile) {
		const notes = this.notes;
		const plugin = this.plugin;
		const types = plugin.getTypes(plugin.getFrontMatter(file));
		for (const t of types) {
			if (!notes[t]) notes[t] = [];
			notes[t].push(file);
		}
	}

	public removeNote(file: TFile, types: string[]) {
		const notes = this.notes;
		for (const t of types) {
			const noteArray = notes[t];
			if (noteArray) {
				noteArray.remove(file);
				if (noteArray.length === 0) delete notes[t];
			}
		}
	}

	/**
	 * Re-classify a note after its frontmatter changed: drop it from every type bucket (its old
	 * types aren't available from the new cache), then re-add it under its current types.
	 */
	public reindexNote(file: TFile) {
		const notes = this.notes;
		for (const t of Object.keys(notes)) {
			notes[t].remove(file);
			if (notes[t].length === 0) delete notes[t];
		}
		this.addNote(file);
	}

	public addTemplate(file: TFile) {
		this.templates[this.getTemplateName(file.path)] = new TemplateData(
			this.plugin.getFrontMatter(file),
			this.plugin.settings.typesProperty,
		);
	}

	public getTemplate(path: string) {
		return this.templates[this.getTemplateName(path)];
	}

	public removeTemplate(path: string) {
		delete this.templates[this.getTemplateName(path)];
	}

	private getTemplateName(path: string) {
		return this.templateNameRegex.exec(path)?.[1] ?? "";
	}

	/** Full link targets (vault-relative path without the `.md` extension) for a type. */
	public getNotesByType(type: string | null | undefined) {
		const files = (type && this.notes[type]) || [];
		return files.map((v) => v.path.replace(/\.md$/, ""));
	}
}

/**
 * Per-view editing session. One instance per MetaView leaf. Owns the file currently shown in
 * that pane, its editable model, the debounced writer, and the dirty-tracking baseline — all
 * independent of other panes. A pinned session stops following the active file and stays on
 * the file it was pinned to (pin state is mirrored from the leaf's native pinned flag).
 */
export class MVSession {
	public data = $state.raw<null | TemplateData | NoteData>(null);
	public file = $state.raw<TFile | null>(null);
	public filename = $state("");
	public pinned = $state(false);

	/** Normalized serialization of the frontmatter currently believed to be on disk. */
	public lastWritten: string | null = null;

	private readonly index: MVIndex;
	private readonly plugin: MetaViewPlugin;
	private readonly leaf: WorkspaceLeaf;
	private readonly writer: Debouncer<[], void>;

	constructor(index: MVIndex, plugin: MetaViewPlugin, leaf: WorkspaceLeaf) {
		this.index = index;
		this.plugin = plugin;
		this.leaf = leaf;
		this.writer = debounce(() => this.flush(), 400, true);
		this.pinned = leaf.getViewState().pinned ?? false;
	}

	// --- facade over the shared index, so components keep using `store.x` unchanged ---

	public get app(): App {
		return this.plugin.app;
	}

	public get templates() {
		return this.index.templates;
	}

	public getNotesByType(type: string | null | undefined) {
		return this.index.getNotesByType(type);
	}

	/** Every tag in the vault, without the leading `#` (frontmatter stores tags unprefixed). */
	public getVaultTags(): string[] {
		return Object.keys(this.plugin.app.metadataCache.getTags()).map((t) =>
			t.replace(/^#/, ""),
		);
	}

	/** CSS classes used anywhere in the vault (from notes' `cssclasses` frontmatter). */
	public getCssClasses(): string[] {
		return this.collectFrontmatterValues("cssclasses");
	}

	/** Known note types: every defined template name plus every type already in use. */
	public getTypeOptions(): string[] {
		return [
			...new Set([
				...Object.keys(this.index.templates),
				// ...Object.keys(this.index.notes),
			]),
		];
	}

	/** Unique string values of `prop` across every markdown file's frontmatter. */
	private collectFrontmatterValues(prop: string): string[] {
		const cache = this.plugin.app.metadataCache;
		const values = new Set<string>();
		for (const file of this.plugin.app.vault.getMarkdownFiles()) {
			const fm = cache.getFileCache(file)?.frontmatter;
			if (!fm) continue;
			for (const v of arrayWrap(fm[prop])) {
				if (typeof v === "string" && v) values.add(v);
			}
		}
		return [...values];
	}

	// --- file loading ---

	/** Load `file` into this pane, flushing any pending write to the previous file first. */
	public loadFile(file: TFile | null) {
		this.flushNow();
		if (file === null || file.extension !== "md") {
			this.file = this.data = null;
			this.filename = "";
		} else {
			this.file = file;
			this.filename = file.name;
			const fm = this.plugin.getFrontMatter(file);
			this.data = this.index.isTemplate(file.path)
				? this.index.getTemplate(file.path)
				: new NoteData(fm, this.plugin.settings.typesProperty, this.index);
		}
		this.markClean();
	}

	// --- workspace event reactions (driven by the plugin's global handlers) ---

	/** The active file changed; follow it unless this pane is pinned. */
	public onActiveFile(file: TFile | null) {
		if (this.pinned) return;
		this.loadFile(file);
	}

	/** A file's metadata changed; refresh derived data and reload if it is the file we show. */
	public onMetadataChanged(
		file: TFile,
		frontmatter: FrontMatter,
		isTemplate: boolean,
	) {
		const isMine = file === this.file;
		// Ignore the metadata event echoed back from our own write to the file we show.
		if (isMine && !this.isExternalChange(frontmatter, isTemplate)) return;

		// A template was re-parsed into the index; any note view's bound props may have changed.
		if (isTemplate && this.data instanceof NoteData) {
			this.data.updateTypeData(this.plugin.settings.typesProperty);
		}
		if (isMine) this.loadFile(file);
	}

	public onFileDeleted(file: TFile) {
		if (file !== this.file) return;
		if (this.pinned) {
			this.leaf.setPinned(false); // unpin → pinned-change resumes following the active file
		} else {
			this.file = this.data = null;
			this.filename = "";
			this.markClean();
		}
	}

	public onFileRenamed(file: TFile, _oldPath: string) {
		// Obsidian keeps the same TFile (its path mutates in place), so identity still holds.
		if (file === this.file) this.loadFile(file);
	}

	// --- pinning (native pin is the source of truth) ---

	/** Mirror the leaf's native pinned flag; on unpin, resume following the active file. */
	public setPinned(pinned: boolean) {
		if (pinned === this.pinned) return;
		this.pinned = pinned;
		if (!pinned) this.loadFile(this.plugin.app.workspace.getActiveFile());
	}

	/** Toggle the leaf's native pin; `setPinned` is then invoked via the `pinned-change` event. */
	public togglePin() {
		this.leaf.setPinned(!this.pinned);
	}

	// --- writing ---

	/** Build the exact frontmatter object the model wants on disk. */
	private desiredFrontmatter(data: NoteData | TemplateData): FrontMatter {
		const typesProp = this.plugin.settings.typesProperty;
		const types = $state.snapshot(data.types);
		const fileProps = $state.snapshot(data.fileProps);
		const props = $state.snapshot(data.props) as unknown as FrontMatter;

		const fm: FrontMatter = {};
		if (types.length > 0) fm[typesProp] = types;
		for (const [k, v] of Object.entries(fileProps)) {
			if (v.length > 0) fm[k] = v;
		}
		Object.assign(fm, props);
		// Re-emit template frontmatter we couldn't model, so editing never drops it.
		if (data instanceof TemplateData) {
			Object.assign(fm, structuredClone(data.passthrough));
		}
		return fm;
	}

	/** Schedule a debounced write of the current model to disk. Call after any edit. */
	public commit() {
		if (this.data && this.file) this.writer();
	}

	/** Write the current model to disk if it differs from what's there (runs debounced). */
	private flush() {
		const data = this.data;
		const file = this.file;
		if (!data || !file) return;

		const fm = this.desiredFrontmatter(data);
		const serialized = stableStringify(fm);
		if (serialized === this.lastWritten) return; // nothing changed versus disk
		this.lastWritten = serialized; // set before writing so the echo is recognized

		if (data instanceof NoteData)
			data.updateTypeData(this.plugin.settings.typesProperty);

		this.plugin.app.fileManager.processFrontMatter(file, (frontmatter) => {
			for (const k of Object.keys(frontmatter)) {
				if (!(k in fm)) delete frontmatter[k];
			}
			Object.assign(frontmatter, fm);
		});
	}

	/** Flush any pending write immediately (call before switching files and on unload). */
	public flushNow() {
		this.writer.run();
	}

	/** Record the current model as the on-disk baseline (call after loading a file). */
	public markClean() {
		this.lastWritten = this.data
			? stableStringify(this.desiredFrontmatter(this.data))
			: null;
	}

	/** True if `frontmatter` differs from what we last wrote/loaded for the file we show. */
	public isExternalChange(
		frontmatter: FrontMatter,
		isTemplate: boolean,
	): boolean {
		const typesProp = this.plugin.settings.typesProperty;
		const model = isTemplate
			? new TemplateData(frontmatter, typesProp)
			: new NoteData(frontmatter, typesProp, this.index);
		return stableStringify(this.desiredFrontmatter(model)) !== this.lastWritten;
	}
}
