import { beforeAll, describe, expect, it } from "vitest";
import { WikiApiClient } from "./wiki-api-client";

describe("WikiApiClient", () => {
	let wikiApiClient: WikiApiClient;

	beforeAll(() => {
		wikiApiClient = new WikiApiClient();
	});

	it("retrieves the page about math.pi", async () => {
		const pageUrl = "math.pi";

		// TODO: The HTTP client should be mocked
		const page = await wikiApiClient.retrievePage(pageUrl);

		expect(page.title).toBe("math.pi");
		expect(page.content).toContain("3.1415");
	});

	it("throws an error when page is not found", async () => {
		const pageUrl = "this-page-does-not-exist";

		await expect(wikiApiClient.retrievePage(pageUrl)).rejects.toThrow(
			"Page with url 'this-page-does-not-exist' was not found",
		);
	});

	it("renders a preview of the text", async () => {
		const text = '```lua\nprint("Hello, world!")\n```';

		// TODO: The HTTP client should be mocked
		const preview = await wikiApiClient.renderText(text);

		expect(preview.html).toContain("Hello, world!");
		// The rendered code should contain a link to the Global.print page
		expect(preview.html).toContain("/gmod/Global.print");
	});
});
