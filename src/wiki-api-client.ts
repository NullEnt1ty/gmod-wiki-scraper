import got from 'got';

import { PagePreviewResponse } from './types';

export class WikiApiClient {
  public static readonly wikiUrl = 'https://wiki.facepunch.com';
  public static readonly wikiApiUrl = `${WikiApiClient.wikiUrl}/api`;

  public async retrievePageContent(pageUrl: string): Promise<string> {
    // Remove '/' or '/gmod/' prefixes
    let pageUrlNormalized = pageUrl.startsWith('/') ? pageUrl.substring(1) : pageUrl;
    pageUrlNormalized = pageUrlNormalized.startsWith('gmod/') ? pageUrlNormalized.substring(5) : pageUrlNormalized;

    return got(`${WikiApiClient.wikiUrl}/gmod/${pageUrlNormalized}?format=text`).text();
  }

  public async renderText(text: string): Promise<PagePreviewResponse> {
    const body = { text: text, realm: 'gmod' };
    const response = await got(`${WikiApiClient.wikiApiUrl}/page/preview`, { method: 'POST', json: body }).json<PagePreviewResponse>();

    return response;
  }

}
