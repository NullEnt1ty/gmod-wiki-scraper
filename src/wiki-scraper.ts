import cheerio from 'cheerio';
import pLimit from 'p-limit';

import { Function, FunctionArgument, FunctionReturnValue, Realm } from './types';
import { WikiApiClient } from './wiki-api-client';

export class WikiScraper {
  private static readonly limit = pLimit(4);

  constructor(private wikiApiClient: WikiApiClient) { }

  public async getGlobalFunctions(): Promise<Array<Function>> {
    const globalFunctionPageUrls = await this.getPagesInCategory('Global');

    return Promise.all(
      globalFunctionPageUrls.map(async (pageUrl) => {
        const page = await WikiScraper.limit(() => this.wikiApiClient.retrievePage(pageUrl));
        return this.parseFunctionPage(page.content);
      })
    );
  }

  public async getClassFunctions(): Promise<Array<Function>> {
    const classFunctionPageUrls = await this.getPagesInCategory('classfunc', '.*:');

    return Promise.all(
      classFunctionPageUrls.map(async (pageUrl) => {
        const page = await WikiScraper.limit(() => this.wikiApiClient.retrievePage(pageUrl));
        return this.parseFunctionPage(page.content);
      })
    );
  }

  public async getLibraryFunctions(): Promise<Array<Function>> {
    const libraryFunctionPageUrls = await this.getPagesInCategory('libraryfunc', '.*\\.');

    return Promise.all(
      libraryFunctionPageUrls.map(async (pageUrl) => {
        const page = await WikiScraper.limit(() => this.wikiApiClient.retrievePage(pageUrl));
        return this.parseFunctionPage(page.content);
      })
    );
  }

  public async getHookFunctions(): Promise<Array<Function>> {
    const hookFunctionPageUrls = await this.getPagesInCategory('hook', '.*:');

    return Promise.all(
      hookFunctionPageUrls.map(async (pageUrl) => {
        const page = await WikiScraper.limit(() => this.wikiApiClient.retrievePage(pageUrl));
        return this.parseFunctionPage(page.content);
      })
    );
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

  private parseFunctionPage(pageContent: string): Function {
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

    const _function: Function = {
      name: name,
      parent: parent,
      description: description,
      realms: realms,
    };

    if (args.length > 0) {
      _function.arguments = args;
    }

    if (returnValues.length > 0) {
      _function.returnValues = returnValues;
    }

    return _function;
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
