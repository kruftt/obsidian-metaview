export const arrayWrap = (v: unknown) => Array.isArray(v) ? v : (v === undefined) ? [] : [v];
export const truthy = (v: any) => v;
