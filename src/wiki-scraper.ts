import cheerio from 'cheerio';
import pLimit from 'p-limit';

import { FunctionPage, FunctionArgument, FunctionReturnValue, Realm } from './types';
import { WikiApiClient } from './wiki-api-client';

export class WikiScraper {
  private static readonly limit = pLimit(4);

  constructor(private wikiApiClient: WikiApiClient) { }

  public async getGlobalFunctions(): Promise<Array<FunctionPage>> {
    const globalFunctionPageUrls = await this.getPagesInCategory('Global');

    return Promise.all(
      globalFunctionPageUrls.map(async (pageUrl) => {
        const pageContent = await WikiScraper.limit(() => this.wikiApiClient.retrievePageContent(pageUrl));
        return this.parseFunctionPage(pageContent);
      })
    );
  }

  public async getClassFunctions(): Promise<Array<FunctionPage>> {
    const classFunctionPageUrls = await this.getPagesInCategory('classfunc', '.*:');

    return Promise.all(
      classFunctionPageUrls.map(async (pageUrl) => {
        const pageContent = await WikiScraper.limit(() => this.wikiApiClient.retrievePageContent(pageUrl));
        return this.parseFunctionPage(pageContent);
      })
    );
  }

  public async getLibraryFunctions(): Promise<Array<FunctionPage>> {
    const libraryFunctionPageUrls = await this.getPagesInCategory('libraryfunc', '.*\\.');

    return Promise.all(
      libraryFunctionPageUrls.slice(0, 4).map(async (pageUrl) => {
        const pageContent = await WikiScraper.limit(() => this.wikiApiClient.retrievePageContent(pageUrl));
        return this.parseFunctionPage(pageContent);
      })
    );

    return [];
  }

  private async getPagesInCategory(category: string, filter = ''): Promise<Array<string>> {
    const response = await this.wikiApiClient.renderText(`<pagelist category="${category}" filter="${filter}"></pagelist>`);

    if (!response.html || response.html === '') {
      throw new Error(`Could not get pages in category '${category}' with filter '${filter}'`);
    }

    const pageUrls: Array<string> = [];
    const $ = cheerio.load(response.html);

    $('ul > li > a').each((i, element) => {
      pageUrls.push(element.attribs.href);
    });

    return pageUrls;
  }

  private parseFunctionPage(pageContent: string): FunctionPage {
    const $ = cheerio.load(pageContent);
    const name = $('function').attr().name;
    const parent = $('function').attr().parent;
    const description = this.trimMultiLineString($('function > description').text());
    const realmsRaw = this.trimMultiLineString($('function > realm').text());
    const realms = this.parseRealms(realmsRaw);
    const args: Array<FunctionArgument> = [];
    const returnValues: Array<FunctionReturnValue> = [];

    $('function > args')
      .children()
      .each((i, element) => {
        const description = $(element).text();

        const argument: FunctionArgument = {
          name: element.attribs.name,
          type: element.attribs.type,
        };

        if (element.attribs.default) {
          argument.default = element.attribs.default;
        }

        if (description && description !== '') {
          argument.description = this.trimMultiLineString(description);
        }

        args.push(argument);
      });

    $('function > rets')
      .children()
      .each((i, element) => {
        const description = $(element).text();
        const name = element.attribs.name;

        const returnValue: FunctionReturnValue = {
          type: element.attribs.type,
        };

        if (name && name !== '') {
          returnValue.name = name;
        }

        if (description && description !== '') {
          returnValue.description = this.trimMultiLineString(description);
        }

        returnValues.push(returnValue);
      });

    const functionPage: FunctionPage = {
      name: name,
      parent: parent,
      description: description,
      realms: realms,
    };

    if (args.length > 0) {
      functionPage.arguments = args;
    }

    if (returnValues.length > 0) {
      functionPage.returnValues = returnValues;
    }

    return functionPage;
  }

  private parseRealms(realmsRaw: string): Array<Realm> {
    const realms = new Set<Realm>();
    const realmsRawLower = realmsRaw.toLowerCase();

    if (realmsRawLower.includes('client')) {
      realms.add('client');
    }

    if (realmsRawLower.includes('menu')) {
      realms.add('menu');
    }

    if (realmsRawLower.includes('server')) {
      realms.add('server');
    }

    if (realmsRawLower.includes('shared')) {
      realms.add('client');
      realms.add('server');
    }

    return Array.from(realms);
  }

  private trimMultiLineString(str: string): string {
    return str
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
      .join(' ')
      .trim();
  }
}
