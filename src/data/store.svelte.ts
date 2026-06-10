import { TFile, Vault, debounce, type Debouncer } from 'obsidian'
import { stableStringify } from '../utils'
import TemplateData from "./TemplateData.svelte"
import NoteData from './NoteData.svelte'
import type MetaViewPlugin from 'Plugin';
import * as CONST from 'const' 

class MVStore {
  public notes: Record<string, Array<TFile>>;
  public templates: Record<string, TemplateData>;
  
  public data = $state.raw<null|TemplateData|NoteData>(null);
  public file = $state.raw<TFile|null>(null);

  /** Normalized serialization of the frontmatter currently believed to be on disk. */
  public lastWritten: string | null = null;

  private plugin: MetaViewPlugin;
  private templateNameRegex: RegExp;
  private writer!: Debouncer<[], void>;
  
  public init(plugin: MetaViewPlugin) {
    this.plugin = plugin;
    this.writer = debounce(() => this.flush(), 400, true);
    const templatesPath = plugin.settings.templatesPath;
    this.templateNameRegex = new RegExp('^' + templatesPath + CONST.TEMPLATE_NAME_REGEX);
    
    this.notes = {};
    this.templates = {};

    Vault.recurseChildren(plugin.app.vault.getRoot(), (file) => {
      if (file instanceof TFile) {
        if (file.path.startsWith(templatesPath)) {
          this.addTemplate(file);
        } else {
          this.addNote(file);
        }
      }
    });
  }

  public addNote(file: TFile) {
    const notes = this.notes;
    const plugin = this.plugin;
    const types = plugin.getTypes(plugin.getFrontMatter(file));
    let noteArray, t;
    for (t of types) {
      noteArray = notes[t] || (notes[t] = []);
      noteArray.push(file);
    }
  }

  public removeNote(file: TFile, types: string[]) {
    const notes = this.notes;
    let noteArray, t;
    for (t of types) {
      noteArray = notes[t];
      if (noteArray) {
        noteArray.remove(file);
        if (noteArray.length === 0) delete notes[t];
      }
    }
  }

  public addTemplate(file: TFile) {
    this.templates[this.getTemplateName(file.path)] = new TemplateData(this.plugin.getFrontMatter(file), this.plugin.settings.typesProperty);
  }

  public getTemplate(path: string) {
    return this.templates[this.getTemplateName(path)];
  }

  public removeTemplate(path: string) {
    delete this.templates[this.getTemplateName(path)];
  }

  private getTemplateName(path: string) {
    return this.templateNameRegex.exec(path)![1];
  }

  public getNotesByType(type: string | null | undefined) {
    const files = type ? this.notes[type] : [];
    return files.map((v) => v.basename);
  }

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

    if (data instanceof NoteData) data.updateTypeData(this.plugin.settings.typesProperty);

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
    this.lastWritten = this.data ? stableStringify(this.desiredFrontmatter(this.data)) : null;
  }

  /** True if `frontmatter` differs from what we last wrote/loaded for the active file. */
  public isExternalChange(frontmatter: FrontMatter, isTemplate: boolean): boolean {
    const typesProp = this.plugin.settings.typesProperty;
    const model = isTemplate
      ? new TemplateData(frontmatter, typesProp)
      : new NoteData(frontmatter, typesProp);
    return stableStringify(this.desiredFrontmatter(model)) !== this.lastWritten;
  }
}

export default new MVStore();
