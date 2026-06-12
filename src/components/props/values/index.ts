import InputValue from "./InputValue.svelte";
import JsonValue from "./JsonValue.svelte";
import LinkValue from "./LinkValue.svelte";
import MultiLinkValue from "./MultiLinkValue.svelte";
import SelectValue from "./SelectValue.svelte";
import TaxonomyValue from "./TaxonomyValue.svelte";

export default {
	"": JsonValue,
	boolean: InputValue,
	number: InputValue,
	text: InputValue,
	date: InputValue,
	"datetime-local": InputValue,
	time: InputValue,
	month: InputValue,
	link: LinkValue,
	multilink: MultiLinkValue,
	taxonomy: TaxonomyValue,
	select: SelectValue,
	multi: JsonValue,
	array: JsonValue,
	tuple: JsonValue,
	map: JsonValue,
	record: JsonValue,
	json: JsonValue,
};
