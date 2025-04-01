import { Menu, setIcon } from 'obsidian';

export function blurOnEnter(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault();
    ; (<HTMLDivElement>e.target).blur();
  }
}

export function createContextMenuCallback(remove: () => void, reset?: () => void) {
  return (e: MouseEvent) => {
    const menu = new Menu();

    // if (template && input_types.contains(template.type))
    if (reset) {
      menu.addItem((item) => item
        .setTitle('Default')
        .setIcon('rotate-ccw')
        .setSection('danger')
        .setWarning(true)
        .onClick(reset)
      );
    }

    if (remove) {
      menu.addItem((item) => item
        .setTitle('Remove')
        .setIcon('trash-2')
        .setSection('danger')
        .setWarning(true)
        .onClick(remove)
      );
    }

    menu.showAtMouseEvent(e);
  }
}
