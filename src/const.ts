export const ID = "metaview";
export const NAME = "MetaView";
export const TEMPLATE_NAME_REGEX = "(?:\/)?(.+).md$";
export const VALID_TYPES: Record<string, true> = {
  'boolean': true,
  'number': true,
  'text': true,
  'date': true,
  'datetime-local': true,
  'time': true,
  'month': true,
  'year': true,
  'link': true,
  'select': true,
  'multi': true,
  'array': true,
  'tuple': true,
  'record': true,
  'map': true,
  'json': true,
};
export const FILE_PROPS: Record<string, true> = {
  'aliases': true,
  'cssclasses': true,
  'tags': true,
}
export const TYPE_ICONS: Record<string, string> = {
  'boolean': 'square-check',
  'number': 'binary',
  'text': 'pencil',
  'date': 'calendar-days',
  'datetime-local': 'calendar-clock',
  'time': 'clock-2',
  'month': 'calendar-x',
  'year': 'calendar',
  'link': 'link',
  'select': 'list-check',
  'multi': 'list-checks',
  'array': 'list-ordered',
  'tuple': 'align-justify',
  'map': 'list',
  'record': 'list',
  'json': 'braces',
};

export const INPUT_TYPES = {
  'json': 'json',
  'boolean': 'input',
  'number': 'input',
  'text': 'input',
  'date': 'input',
  'datetime-local': 'input',
  'time': 'input',
  'month': 'input',
  'link': 'link',
  'select': 'select',
  'multi': 'json',
  'array': 'json',
  'tuple': 'json',
  'map': 'json',
  'record': 'json',
  '': 'json',
}

export const OPTIONS_TYPES: Record<MVInputDef["type"], { name: string, type: string}[]> = {
  'boolean': [{ name: 'default', type: 'checkbox' }],
  'number' : [
    { name: "default", type: "number" },
    { name: "min", type: "number" },
    { name: "max", type: "number" },
    { name: "step", type: "number" },
  ],
  'text' : [
    { name: "default", type: "text" },
    { name: "minlength", type: "number" },
    { name: "maxlength", type: "number" },
    { name: "pattern", type: "text" }
  ],
  'date' : [
    { name: "default", type: 'date' },
    { name: "min", type: 'date' },
    { name: "max", type: 'date' },
    { name: "step", type: 'number' }
  ],
  'datetime-local' : [
    { name: 'default', type: 'datetime-local' },
    { name: "min", type: 'datetime-local' },
    { name: "max", type: 'datetime-local' },
    { name: "step", type: 'number' }
  ],
  'time' : [
    { name: 'default', type: 'time' },
    { name: "min", type: 'time' },
    { name: "max", type: 'time' },
    { name: "step", type: 'number' }
  ],
  'month' : [
    { name: 'default', type: 'month' },
    { name: "min", type: 'month' },
    { name: "max", type: 'month' },
    { name: "step", type: 'number' }
  ],
};

export const PROPERTY_TYPES = [
  "text",
  "boolean",
  "number",
  "select",
  "multi",
  "link",
  "date",
  "time",
  "datetime-local",
  "month",
  "tuple",
  "array",
  "record",
  "map",
  "json",
];
