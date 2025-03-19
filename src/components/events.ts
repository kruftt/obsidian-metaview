export function blurOnEnter(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault();
    ; (<HTMLDivElement>e.target).blur();
  }
}
