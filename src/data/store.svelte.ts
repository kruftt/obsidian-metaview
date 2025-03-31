import { type FrontMatterCache, TFile, Vault } from 'obsidian'
import TemplateData from "./TemplateData.svelte"
import NoteData from './NoteData.svelte'
import type MetaViewPlugin from 'Plugin';
import * as CONST from 'const' 
import { arrayWrap } from 'utils'

class MVStore {
  public notes: Record<string, Array<TFile>>;
  public templates: Record<string, TemplateData>;
  
  public data = $state.raw<null|TemplateData|NoteData>(null);
  public file = $state.raw<TFile|null>(null);
  public updating = false;
  
  private plugin: MetaViewPlugin;
  private templateNameRegex: RegExp;
  
  public init(plugin: MetaViewPlugin) {
    this.plugin = plugin;
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

  public getNotesByType(type: string) {
    const files = this.notes[type] || [];
    return files.map((v) => v.basename);
  }

  public sync() {
    console.log('sync');
    const data = this.data;
    if (data === null) return;

    const types = $state.snapshot(data.types);
    const fileProps = $state.snapshot(data.fileProps);
    const props = $state.snapshot(data.props);
    this.updating = !this.updating;
    console.log('updating', this.updating);

    if (this.updating) {
      if (data instanceof NoteData) {
        data.updateTypeData(this.plugin.settings.typesProperty);
      }

      this.plugin.app.fileManager!.processFrontMatter(this.file!, (frontmatter) => {
        let k, v;
        for (k of Object.keys(frontmatter)) {
          if (props[k] === undefined) {
            delete frontmatter[k];
          }
        }

        if (types.length > 0) frontmatter[this.plugin.settings.typesProperty] = types;
        for ([k, v] of Object.entries(fileProps)) {
          if (v.length > 0) frontmatter[k] = v;
        }
        Object.assign(frontmatter, props);
      });
    }
  }
}

export default new MVStore();
