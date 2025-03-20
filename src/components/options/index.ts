import BoolOptions from "./BoolOptions.svelte"
import NumberOptions from "./NumberOptions.svelte"
import TextOptions from "./TextOptions.svelte"
import DateTimeOptions from "./DateTimeOptions.svelte"

export default {
  boolean: BoolOptions,
  number: NumberOptions,
  text: TextOptions,
  date: DateTimeOptions,
  'datetime-local': DateTimeOptions,
  time: DateTimeOptions,
  month: DateTimeOptions,
}