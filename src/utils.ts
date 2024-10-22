
export const arrayWrap = (v: any) => Array.isArray(v) ? v : (v === undefined) ? [] : [v];
