import { TFile, TFolder } from 'obsidian'
import type MetaViewPlugin from "main";
import TemplateData from "./TemplateData.svelte";

const TEMPLATE_NAME_REGEX = "(?:\/)?(.+).md$";

export default class TemplateCache {
  private templateNameRegex: RegExp;
  public templates = $state<Record<string, TemplateData>>({});

  constructor(plugin: MetaViewPlugin) {
    const { app, settings } = plugin;
    const { templatesPath } = settings;
    
    this.templateNameRegex = new RegExp('^' + templatesPath + TEMPLATE_NAME_REGEX);
    
    const typesDir = app.vault.getFolderByPath(templatesPath);
    if (typesDir === null) {
      console.warn("Metaview: Could not find templates directory: ", templatesPath);
      return;
    }

    const templates = this.templates;
    const metadataCache = app.metadataCache;
    const directoryQueue: TFolder[] = [typesDir];
    let currentDirectory: TFolder | undefined;

    while (currentDirectory = directoryQueue.pop()) {
      for (let entry of currentDirectory.children) {
        if (entry instanceof TFile) {
          const frontmatter = metadataCache.getFileCache(entry)?.frontmatter || {};
          const template = new TemplateData(frontmatter);
          templates[this.getTemplateName(entry.path)] = template;
          for (let alias of template.aliases) {
            templates[alias] = template;
          }
        } else {
          directoryQueue.push(<TFolder>entry);
        }
      }
    }
  }

  private getTemplateName(path: string) {
    return this.templateNameRegex.exec(path)![1];
  }

  // public get(path: string): TemplateData
  public get(name: string): TemplateData
  public get(file: TFile): TemplateData
  public get(nameOrFile: string | TFile) {
    if (nameOrFile instanceof TFile) {
      const name = this.getTemplateName(nameOrFile.path);
      return this.templates[name];
    }

    // const result = this.templateNameRegex.exec(nameOrFile);
    // if (result) return this.cache[result[1]];

    return this.templates[nameOrFile];
  }

  public add(path: string, template: TemplateData) {
    const templates = this.templates;
    templates[this.getTemplateName(path)] = template;
    for (let alias of template.aliases) {
      templates[alias] = template;
    }
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
    for (let alias of template.aliases) {
      delete templates[alias];
    }
  }
}
