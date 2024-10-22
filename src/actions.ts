import refs from './refs'
import { arrayWrap } from './utils'
import fileStore from './fileStore';

export function addType(type: string) {
  refs.fileManager!.processFrontMatter(fileStore.activeFile!, (frontmatter) => {
    const types = arrayWrap(frontmatter.types);
    // const aliases: string[] = arrayWrap(frontmatter.aliases);
    // const tags: string[] = arrayWrap(frontmatter.tags);
    // const cssclasses: string[] = arrayWrap(frontmatter.cssclasses);

    types.push(type);

    // const typeQueue = [type];
    // let t: string | undefined;

    // while (t = typeQueue.pop()) {
    //   const template = templateCache.templates[type];
    //   if (!template) continue;
    //   typeQueue.push(...template.types);
    //   aliases.push(...template.aliases);
    //   tags.push(...template.tags);
    //   cssclasses.push(...template.cssclasses);
    // }

    // Object.assign(frontmatter, { types, aliases, tags, cssclasses });
    frontmatter.types = types;
  });
}

export function removeType(type: string) {
  refs.fileManager!.processFrontMatter(fileStore.activeFile!, (frontmatter) => {
    const types = arrayWrap(frontmatter.types);
    // const aliases: string[] = arrayWrap(frontmatter.aliases);
    // const tags: string[] = arrayWrap(frontmatter.tags);
    // const cssclasses: string[] = arrayWrap(frontmatter.cssclasses);

    types.remove(type);
    // const typeQueue = [type];
    // let t: string | undefined;

    // while (t = typeQueue.pop()) {
    //   const template = templateCache[type];
    //   if (!template) continue;
    //   template.types.forEach((v) => typeQueue.remove(v));
    //   template.aliases.forEach((v) => aliases.remove(v));
    //   template.tags.forEach((v) => tags.remove(v));
    //   template.cssclasses.forEach((v) => cssclasses.remove(v));
    // }

    // Object.assign(frontmatter, { types, aliases, tags, cssclasses });
    frontmatter.types = types;
  });
}

// To support nested properties
function getTarget(address: string[], target: Record<string, any>) {
  let key: string | undefined;
  for (let i = 0; i < address.length - 1; i++) {
    key = address[i];
    target = target[key!];
  }
  return target;
}

export function setProperty(address: string[], value: unknown) {
  console.log('setting prop', address, value);
  fileStore.updating = true;
  refs.fileManager!.processFrontMatter(fileStore.activeFile!, (frontmatter) => {
    getTarget(address, frontmatter)[address.at(-1)!] = value;
  });
}

export function removeProperty(address: string[]) {
  fileStore.updating = true;
  refs.fileManager!.processFrontMatter(fileStore.activeFile!, (frontmatter) => {
    delete getTarget(address, frontmatter)[address.at(-1)!];
  });
}

// This should only work for free properties... which could still be objects
export function setKey(address: string[], key: string) {
  fileStore.updating = true;
  refs.fileManager!.processFrontMatter(fileStore.activeFile!, (frontmatter) => {
    const target = getTarget(address, frontmatter);
    const target_key = address.at(-1)!;
    target[key] = target[target_key];
    delete target[target_key];
  });
}
