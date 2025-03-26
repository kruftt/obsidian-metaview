import { Menu, setIcon } from 'obsidian';

export function blurOnEnter(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault();
    ; (<HTMLDivElement>e.target).blur();
  }
}

export function getSetKeyCallback(context: Record<string, any>, key: string) {
  return (e: Event) => {
    const target = <HTMLInputElement>e.target;
    const newKey = target.value;
    if (newKey === key) return;
    if (newKey in context) {
      target.value = key;
    } else {
      context[newKey] = context[key];
      delete context[key];
      key = newKey;
    }
  };
}

export function getContextMenuCallback(context: Record<string, any>, key: string, template?: MVPropDef) {
  return (e: MouseEvent) => {
    const menu = new Menu();

    if (template && 'default' in template) {
      menu.addItem((item) => item
        .setTitle('Default')
        .setIcon('rotate-ccw')
        .setSection('danger')
        .setWarning(true)
        .onClick(() => context[key] = template.default!)
      );
    }

    menu.addItem((item) => item
      .setTitle('Remove')
      .setIcon('trash-2')
      .setSection('danger')
      .setWarning(true)
      .onClick(() => {
        delete context[key];
      })
    );

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