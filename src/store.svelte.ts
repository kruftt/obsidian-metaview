import { TAbstractFile, TFile } from 'obsidian';
import type MetaViewPlugin from '../main';
import TemplateCache from './TemplateCache.svelte';
import TemplateData from './TemplateData.svelte';
import NoteData from './NoteData.svelte';

class MVStore {
  public data = $state.raw<null|TemplateData|NoteData>(null);
  private cache: TemplateCache;
  private updating: Boolean = false;
  private file: TFile | null = null;
  private plugin: MetaViewPlugin;
  
  public init(plugin: MetaViewPlugin) {
    this.plugin = plugin;
    this.cache = new TemplateCache(plugin);
  }

  public open = (file: TFile | null) => {
    this.file = file;
    const plugin = this.plugin;
    if (file === null || file.extension !== 'md') {
      this.data = null;
    } else if (file.path.startsWith(plugin.settings.templatesPath)) {
      this.data = this.cache.get(file);
    } else {
      this.data = new NoteData(this.getFrontMatter(file), this.cache);
    }
  }

  public changed = (file: TFile) => {
    if (file.extension !== 'md') return;
    if (file === this.file && this.updating) {
      this.updating = false;
      return;
    }

    const plugin = this.plugin;
    const path = file.path;
    if (path.startsWith(plugin.settings.templatesPath)) {  
      this.cache.remove(path);
      this.cache.add(path, new TemplateData(this.getFrontMatter(file)));

      if (this.data instanceof NoteData) {
        this.data.updateTypeData(this.cache);
      }
    }
    
    if (file === this.file) {
      this.open(file);
    }
  }

  public rename = (file: TAbstractFile, oldPath: string) => {
    if (!(file instanceof TFile)) return;
    const { templatesPath } = this.plugin.settings;
    const cache = this.cache;
    const path = file.path;
    let cacheUpdated = false;

    if (oldPath.startsWith(templatesPath)) {
      if (path.startsWith(templatesPath)) {
        cache.rename(oldPath, path);
      } else {
        cache.remove(oldPath);
      }
      cacheUpdated = true;
    } else {
      if (path.startsWith(templatesPath)) {
        cache.add(path, new TemplateData(this.getFrontMatter(file)));
        cacheUpdated = true;
      }
    }

    const data = this.data;
    if (cacheUpdated && data instanceof NoteData) {
      data.updateTypeData(cache);
    }
  }

  public deleted = (file: TFile) => {
    const path = file.path;
    if (file.extension === 'md' && path.startsWith(this.plugin.settings.templatesPath)) {
      this.cache.remove(path);
    }
  }

  public setProperty(key: string, value: FrontMatterValue | null, address: string[] = []) {
    this.updating = true;

    this.plugin.app.fileManager!.processFrontMatter(this.file!, (frontmatter) => {
      let target = frontmatter;
      for (let k of address) target = <Record<string, FrontMatter>>target[k];
      if (value !== null) {
        target[key] = value;
      } else {
        delete target[key];
        const data = this.data;
        if (data instanceof NoteData && address.length == 0) {
          data.freeProps.delete(key);
        }
      }
    });
  }

  public insertFilePropValue(prop: MVFilePropType, value: string) {
    const data = this.data!;
    
    if (prop === 'aliases') {
      if (data instanceof TemplateData) {
        this.cache.templates[value] = data;
      }
    } else if (prop === 'types') {
      if (data instanceof NoteData) {
        data.updateTypeData(this.cache);
      }
    }

    this.updating = true;
    this.plugin.app.fileManager!.processFrontMatter(this.file!, (frontmatter) => {
      frontmatter[prop] = Array.from(data[prop]);
    });
  }

  public removeFilePropValue(prop: MVFilePropType, value: string) {
    const data = this.data!; 

    if (prop === 'aliases') {
      if (data instanceof TemplateData) {
        delete this.cache.templates[value];
      }
    } else if (prop === 'types') {
      if (data instanceof NoteData) {
        data.updateTypeData(this.cache);
      }
    }

    this.updating = true;
    this.plugin.app.fileManager!.processFrontMatter(this.file!, (frontmatter) => {
      const valueArray = Array.from(data[prop]);
      if (valueArray.length > 0) frontmatter[prop] = valueArray;
      else delete frontmatter[prop];
    });
  }

  private getFrontMatter(file: TFile) {
    return this.plugin.app.metadataCache.getFileCache(file)?.frontmatter || {};
  }
}


const store = new MVStore();
//@ts-ignore
window.store = store;
export default store;
