import { setIcon } from 'obsidian';

export default function createExpand() {
  let _icon: HTMLElement | null = null;
  const expand: {
    icon: HTMLElement | null
    open: boolean
    toggle: () => void
  } = $state({
    get icon() {
      return _icon;
    },
    set icon(icon: HTMLElement | null) {
      _icon = icon;
      updateIcon();
    },
    open: false,
    toggle: () => {
      expand.open = !expand.open;
      updateIcon();
    }
  });

  function updateIcon() {
    const icon = expand.icon;
    if (icon) setIcon(icon, expand.open ? 'chevron-down' : 'chevron-right');
  }

  return expand;
}