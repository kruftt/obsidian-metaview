import store from 'src/store.svelte'

export function blurOnEnter(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault();
    ; (<HTMLDivElement>e.target).blur();
  }
}

// Either one callback for each component
// or each component stores address with separator

// separator is a bit of a hack
// both require data- attribute (address or key)

export function makeUpdateCallback(address: string[], data: Record<string, any>) {
  return (e: Event) => {
    const target = <HTMLElement>e.target;
    const key = target.dataset.key!;
    store.setProperty(address, key, data[key]);
  }
}
