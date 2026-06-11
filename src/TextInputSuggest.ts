import { AbstractInputSuggest, type App } from "obsidian";

/**
 * Generic autocomplete over Obsidian's native input-suggest popover (the same
 * machinery the Properties panel uses). Attach to an `<input>` or a
 * contenteditable div; supply the candidate list and a selection handler.
 */
export class TextInputSuggest extends AbstractInputSuggest<string> {
	constructor(
		app: App,
		inputEl: HTMLInputElement | HTMLDivElement,
		private readonly getItems: (query: string) => string[],
		private readonly onChoose: (value: string) => void,
	) {
		super(app, inputEl);
	}

	protected getSuggestions(query: string): string[] {
		return this.getItems(query);
	}

	renderSuggestion(value: string, el: HTMLElement): void {
		el.setText(value);
	}

	selectSuggestion(value: string): void {
		this.onChoose(value);
		this.close();
	}
}
