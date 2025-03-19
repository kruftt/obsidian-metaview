import { type FrontMatterCache, TFile, Vault } from 'obsidian'
import { tick } from 'svelte'
import TemplateData from "./TemplateData.svelte";
import NoteData from './NoteData.svelte';
import type MetaViewPlugin from 'main';
import * as CONST from './constants'
import { arrayWrap } from './utils';

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
      // console.log('loading', file.name);
      if (file instanceof TFile) {
        if (file.path.startsWith(templatesPath)) {
          this.addTemplate(file);
        } else {
          this.addNote(file);
        }
      }
    });

    // console.log(this);
  }

  public addNote(file: TFile) {
    const notes = this.notes;
    const types = this.getTypes(this.getFrontMatter(file));
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
    this.templates[this.getTemplateName(file.path)] = new TemplateData(this.getFrontMatter(file), this.plugin.settings.typesProperty);
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

  public getFrontMatter(file: TFile) {
    return this.plugin.app.metadataCache.getFileCache(file)?.frontmatter || {};
  }

  public getTypes(fm: FrontMatterCache) {
    return arrayWrap(fm[this.plugin.settings.typesProperty]);
  }

  public sync() {
    const data = this.data;
    if (data === null) return;

    const props = $state.snapshot(data.props);
    this.updating = !this.updating;

    if (this.updating) {
      if (data instanceof NoteData) {
        data.updateTypeData();
      }

      this.plugin.app.fileManager!.processFrontMatter(this.file!, (frontmatter) => {
        frontmatter[this.plugin.settings.typesProperty] = [...data.types];
        let k;
        for (k of Object.keys(frontmatter)) {
          if (props[k] === undefined) {
            delete frontmatter[k];
          }
        }
        Object.assign(frontmatter, props);
      });
    }
  }
}

export default new MVStore();
