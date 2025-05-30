import { TAbstractFile, TFile, TFolder, Vault } from 'obsidian'
import type MetaViewPlugin from "Plugin";
import TemplateData from './TemplateData.svelte'
import { TEMPLATE_NAME_REGEX } from 'const'
export default class TemplateCache {
  private templateNameRegex: RegExp;
  public templates = $state<Record<string, TemplateData>>({});

  constructor(plugin: MetaViewPlugin) {
    const { app, settings } = plugin;
    const { templatesPath, typesProperty } = settings;
    
    this.templateNameRegex = new RegExp('^' + templatesPath + TEMPLATE_NAME_REGEX);
    
    const typesDir = app.vault.getFolderByPath(templatesPath);
    if (typesDir === null) {
      console.warn("Metaview: Could not find templates directory: ", templatesPath);
      return;
    }

    const templates = this.templates;
    const metadataCache = app.metadataCache;

    Vault.recurseChildren(typesDir, (file: TAbstractFile) => {
      if (file instanceof TFile) {
        const frontmatter = metadataCache.getFileCache(file)?.frontmatter || {};
        const template = new TemplateData(frontmatter, typesProperty);
        templates[this.getTemplateName(file.path)] = template;
        // for (let alias of template.aliases) {
        //   templates[alias] = template;
        // }
      }
    });
  }

  private getTemplateName(path: string) {
    return this.templateNameRegex.exec(path)![1];
  }

  public get(name: string): TemplateData
  public get(file: TFile): TemplateData
  public get(nameOrFile: string | TFile) {
    if (nameOrFile instanceof TFile) {
      const name = this.getTemplateName(nameOrFile.path);
      return this.templates[name];
    }
    return this.templates[nameOrFile];
  }

  public add(path: string, template: TemplateData) {
    const templates = this.templates;
    templates[this.getTemplateName(path)] = template;
    // for (let alias of template.aliases) {
    //   templates[alias] = template;
    // }
  }

  public rename(oldPath: string, path: string) {
    const templates = this.templates;
    const oldName = this.getTemplateName(oldPath);
    const name = this.getTemplateName(path);
    templates[name] = templates[oldName];
    delete templates[oldName];
  }

  public remove(path: string) {
    const templates = this.templates;
    const name = this.getTemplateName(path);
    const template = templates[name];
    if (!template) return;
    delete templates[name];
    // for (let alias of template.aliases) {
    //   delete templates[alias];
    // }
  }
}
