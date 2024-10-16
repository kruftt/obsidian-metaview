import { FileManager, MetadataCache, Vault } from 'obsidian'
import type MetaViewPlugin from '../main'

type Ref<T> = T | null

export default {
  settings: <Ref<MVSettings>> null,
  metadataCache: <Ref<MetadataCache>> null,
  fileManager: <Ref<FileManager>> null,
  vault: <Ref<Vault>> null,

  init(plugin: MetaViewPlugin) {
    this.settings = plugin.settings;
    const app = plugin.app;
    this.metadataCache = app.metadataCache;
    this.fileManager = app.fileManager;
    this.vault = app.vault;
  },

  clear() {
    this.settings = null;
    this.metadataCache = null;
    this.fileManager = null;
    this.vault = null;
  }
}