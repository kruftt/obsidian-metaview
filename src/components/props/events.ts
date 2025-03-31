import { Menu, setIcon } from 'obsidian';

export function blurOnEnter(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault();
    ; (<HTMLDivElement>e.target).blur();
  }
}

// export function createSetValueOnBlur(context: Record<string, any>, key: string) {
//   return (e: Event) => context[key] = (<HTMLInputElement>e.target).value;
// }

// export function getSetKeyCallback(context: Record<string, any>, key: string) {
//   return (e: Event) => {
//     const target = <HTMLInputElement>e.target;
//     const newKey = target.value;
//     if (newKey === key) return;
//     if (newKey in context) {
//       target.value = key;
//     } else {
//       context[newKey] = context[key];
//       delete context[key];
//       key = newKey;
//     }
//   };
// }


// const input_types = "number boolean text date datetime-local time month";

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

// export function setValue(target: HTMLInputElement, context: Record<string, any>, key: string) {
//   switch (target.type) {
//     case 'checkbox':
//       context[key] = target.checked;
//       break;
//     case 'number':
//       context[key] = parseFloat(target.value);
//       break;
//     default:
//       context[key] = target.value;
//   }
// }