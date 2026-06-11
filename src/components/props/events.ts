import type { MVSession } from "data/store.svelte";
import { Menu } from "obsidian";

export function blurOnEnter(e: KeyboardEvent) {
	if (e.key === "Enter") {
		e.preventDefault();
		(<HTMLDivElement>e.target).blur();
	}
}

export function blurOnSpace(e: KeyboardEvent) {
	if (e.key === "Enter" || e.key === " ") {
		e.preventDefault();
		(<HTMLDivElement>e.target).blur();
	}
}

/**
 * Keyboard counterpart to a click handler for elements that must remain a
 * `<div role="button">` (e.g. a clickable row that already contains a button).
 * Fires the handler on Enter/Space, matching native button activation.
 */
export function activateOnKey(handler: (e: KeyboardEvent) => void) {
	return (e: KeyboardEvent) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handler(e);
		}
	};
}

export function createContextMenuCallback(
	store: MVSession,
	remove: () => void,
	reset?: () => void,
) {
	return (e: MouseEvent) => {
		const menu = new Menu();

		if (reset) {
			menu.addItem((item) =>
				item
					.setTitle("Default")
					.setIcon("rotate-ccw")
					.setSection("danger")
					.setWarning(true)
					.onClick(() => {
						reset();
						store.commit();
					}),
			);
		}

		if (remove) {
			menu.addItem((item) =>
				item
					.setTitle("Remove")
					.setIcon("trash-2")
					.setSection("danger")
					.setWarning(true)
					.onClick(() => {
						remove();
						store.commit();
					}),
			);
		}

		// A keyboard-activated click has no cursor position (detail 0, coords 0,0),
		// so anchor the menu to the triggering element instead of the corner.
		if (e.detail === 0) {
			const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
			menu.showAtPosition({ x: rect.left, y: rect.bottom });
		} else {
			menu.showAtMouseEvent(e);
		}
	};
}

export function createSetKey(
	context: Record<string, FrontMatterValue>,
	key: string,
) {
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
