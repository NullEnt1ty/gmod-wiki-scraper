import got from "got";

import { PagePreviewResponse, WikiPage, PageJsonResponse } from "./types.js";

export class WikiApiClient {
	public static readonly wikiUrl = "https://wiki.facepunch.com";
	public static readonly wikiApiUrl = `${WikiApiClient.wikiUrl}/api`;

	public async retrievePage(pageUrl: string): Promise<WikiPage> {
		// Remove '/' or '/gmod/' prefixes
		let pageUrlNormalized = pageUrl.startsWith("/")
			? pageUrl.substring(1)
			: pageUrl;
		pageUrlNormalized = pageUrlNormalized.startsWith("gmod/")
			? pageUrlNormalized.substring(5)
			: pageUrlNormalized;

		const response = await got(
			`${WikiApiClient.wikiUrl}/gmod/${pageUrlNormalized}?format=json`,
		).json<PageJsonResponse>();

		if (response.title === "Page Not Found") {
			throw new Error(`Page with url '${pageUrl}' was not found`);
		}

		return {
			content: response.markup,
			title: response.title,
		};
	}

	public async renderText(text: string): Promise<PagePreviewResponse> {
		const body = { text: text, realm: "gmod" };
		const response = await got(`${WikiApiClient.wikiApiUrl}/page/preview`, {
			method: "POST",
			json: body,
		}).json<PagePreviewResponse>();

		return response;
	}
}
