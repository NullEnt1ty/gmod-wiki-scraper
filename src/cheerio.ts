export function isTagElement(element: unknown): element is cheerio.TagElement {
	return (
		typeof element === "object" &&
		element !== null &&
		"type" in element &&
		element.type === "tag"
	);
}
