import { Menu, setIcon } from 'obsidian';
import type { MVStore } from 'data/store.svelte';

export function blurOnEnter(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault();
    ;(<HTMLDivElement>e.target).blur();
  }
}

export function blurOnSpace(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    ;(<HTMLDivElement>e.target).blur();
  }
}

export function createContextMenuCallback(store: MVStore, remove: () => void, reset?: () => void) {
  return (e: MouseEvent) => {
    const menu = new Menu();

    if (reset) {
      menu.addItem((item) => item
        .setTitle('Default')
        .setIcon('rotate-ccw')
        .setSection('danger')
        .setWarning(true)
        .onClick(() => { reset(); store.commit(); })
      );
    }

    if (remove) {
      menu.addItem((item) => item
        .setTitle('Remove')
        .setIcon('trash-2')
        .setSection('danger')
        .setWarning(true)
        .onClick(() => { remove(); store.commit(); })
      );
    }

    menu.showAtMouseEvent(e);
  }
}

export function createSetKey(context: Record<string, any>, key: string) {
  return (e: Event) => {
    const target = <HTMLInputElement>e.target;
    const newKey = target.value;
    if (!newKey || newKey === key) return;
    if (newKey in context) {
      target.value = key;
    } else {
      context[newKey] = context[key];
      delete context[key];
      key = newKey;
    }
  };
}