import cheerio from 'cheerio';
import { SingleBar, Presets } from 'cli-progress';
import pLimit from 'p-limit';

import { Function, FunctionArgument, FunctionReturnValue, Realm, Class, Panel, WikiPage, Type, Enum, EnumItem } from './types';
import { WikiApiClient } from './wiki-api-client';
import logger from './logger';

export class WikiScraper {
  private static readonly limit = pLimit(8);
  private readonly progressBar = new SingleBar({}, Presets.shades_classic);

  constructor(private wikiApiClient: WikiApiClient) { }

  public async getGlobalFunctions(): Promise<Array<Function>> {
    const globalFunctionPageUrls = await this.getPagesInCategory('Global');
    this.progressBar.start(globalFunctionPageUrls.length, 0);

    const globalFunctionPages = await Promise.all(globalFunctionPageUrls.map(async (pageUrl) => {
      const page = await WikiScraper.limit(() => this.wikiApiClient.retrievePage(pageUrl));
      this.progressBar.increment();

      return page;
    }));

    this.progressBar.stop();

    const globalFunctions: Array<Function> = [];

    globalFunctionPages.forEach((globalFunctionPage) => {
      if (this.isFunctionPage(globalFunctionPage.content)) {
        const globalFunction = this.parseFunctionPage(globalFunctionPage.content);
        globalFunctions.push(globalFunction);
      } else {
        logger.warn(`Unknown page type encountered on page '${globalFunctionPage.title}'`);
      }
    });

    return globalFunctions;
  }

  public async getClasses(): Promise<Array<Class>> {
    const classPageUrls = await this.getPagesInCategory('classfunc');
    this.progressBar.start(classPageUrls.length, 0);

    const classPages = await Promise.all(classPageUrls.map(async (pageUrl) => {
      const page = await WikiScraper.limit(() => this.wikiApiClient.retrievePage(pageUrl));
      this.progressBar.increment();

      return page;
    }));

    this.progressBar.stop();

    return this.buildClasses(classPages);
  }

  public async getLibraries(): Promise<Array<Class>> {
    const libraryPageUrls = await this.getPagesInCategory('libraryfunc');
    this.progressBar.start(libraryPageUrls.length, 0);

    const libraryPages = await Promise.all(libraryPageUrls.map(async (pageUrl) => {
      const page = await WikiScraper.limit(() => this.wikiApiClient.retrievePage(pageUrl));
      this.progressBar.increment();

      return page;
    }));

    this.progressBar.stop();

    return this.buildClasses(libraryPages);
  }

  public async getHooks(): Promise<Array<Class>> {
    const hookPageUrls = await this.getPagesInCategory('hook', '.*:');
    this.progressBar.start(hookPageUrls.length, 0);

    const hookPages = await Promise.all(hookPageUrls.map(async (pageUrl) => {
      const page = await WikiScraper.limit(() => this.wikiApiClient.retrievePage(pageUrl));
      this.progressBar.increment();

      return page;
    }));

    this.progressBar.stop();

    return this.buildClasses(hookPages);
  }

  public async getPanels(): Promise<Array<Class>> {
    const panelPageUrls = await this.getPagesInCategory('panelfunc');
    this.progressBar.start(panelPageUrls.length, 0);

    const panelPages = await Promise.all(panelPageUrls.map(async (pageUrl) => {
      const page = await WikiScraper.limit(() => this.wikiApiClient.retrievePage(pageUrl));
      this.progressBar.increment();

      return page;
    }));

    this.progressBar.stop();

    return this.buildClasses(panelPages);
  }

  public async getEnums(): Promise<Array<Enum>> {
    const enumPageUrls = await this.getPagesInCategory('enum');
    this.progressBar.start(enumPageUrls.length, 0);

    const enumPages = await Promise.all(enumPageUrls.map(async (pageUrl) => {
      const page = await WikiScraper.limit(() => this.wikiApiClient.retrievePage(pageUrl));
      this.progressBar.increment();

      return page;
    }));

    this.progressBar.stop();

    const enums: Array<Enum> = [];

    enumPages.forEach((enumPage) => {
      if (this.isEnumPage(enumPage.content)) {
        const _enum = this.parseEnumPage(enumPage.content);
        _enum.name = enumPage.title;

        enums.push(_enum);
      } else {
        logger.warn(`Unknown page type encountered on page '${enumPage.title}'`);
      }
    });

    return enums;
  }

  private async getPagesInCategory(category: string, filter = ''): Promise<Array<string>> {
    const response = await this.wikiApiClient.renderText(`<pagelist category="${category}" filter="${filter}"></pagelist>`);

    if (!response.html || response.html === '') {
      throw new Error(`Could not get pages in category '${category}' with filter '${filter}'`);
    }

    const pageUrls: Array<string> = [];
    const $ = this.parseContent(response.html);

    $('ul > li > a').each((i, element) => {
      pageUrls.push(element.attribs.href);
    });

    return pageUrls;
  }

  private buildClasses(wikiPages: Array<WikiPage>): Array<Class> {
    const classes = new Map<string, Class>();

    wikiPages.forEach((wikiPage) => {
      // Examples:
      // ContentIcon
      // ContentIcon:GetColor
      // achievements
      // achievements.BalloonPopped
      const className = wikiPage.title.includes(':')
        ? wikiPage.title.split(':')[0]
        : wikiPage.title.includes('.')
          ? wikiPage.title.split('.')[0]
          : wikiPage.title;

      const _class: Class = classes.get(className) ?? { name: className };

      if (this.isPanelPage(wikiPage.content)) {
        const panel = this.parsePanelPage(wikiPage.content);
        _class.parent = panel.parent;

        if (panel.description) {
          _class.description = panel.description;
        }
      } else if (this.isTypePage(wikiPage.content)) {
        const type = this.parseTypePage(wikiPage.content);

        if (type.description) {
          _class.description = type.description;
        }
      } else if (this.isFunctionPage(wikiPage.content)) {
        const _function = this.parseFunctionPage(wikiPage.content);

        _class.functions = _class.functions ?? [];
        _class.functions.push(_function);
      } else {
        logger.warn(`Unknown page type encountered on page '${wikiPage.title}'`);
      }

      classes.set(className, _class);
    });

    return Array.from(classes.values());
  }

  private parseFunctionPage(pageContent: string): Function {
    const $ = this.parseContent(pageContent);
    const name = $('function').attr().name;
    const parent = $('function').attr().parent;
    const description = $('function > description').html();
    const realmsRaw = this.trimMultiLineString($('function > realm').text());
    const realms = this.parseRealms(realmsRaw);
    const args: Array<FunctionArgument> = [];
    const returnValues: Array<FunctionReturnValue> = [];

    $('function > args')
      .children()
      .each((i, element) => {
        const description = $(element).html();

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
        const description = $(element).html();
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
      realms: realms,
    };

    if (description && description !== '') {
      _function.description = this.trimMultiLineString(description);
    }

    if (args.length > 0) {
      _function.arguments = args;
    }

    if (returnValues.length > 0) {
      _function.returnValues = returnValues;
    }

    return _function;
  }

  private parsePanelPage(pageContent: string): Panel {
    const $ = this.parseContent(pageContent);
    const parent = this.trimMultiLineString($('panel > parent').text());
    const description = $('panel > description').html();

    const panel: Panel = {
      parent: parent,
    };

    if (description && description !== '') {
      panel.description = this.trimMultiLineString(description);
    }

    return panel;
  }

  private parseTypePage(pageContent: string): Type {
    const $ = this.parseContent(pageContent);
    const name = $('type').attr().name;
    const description = $('type > summary').html();

    const type: Type = {
      name: name,
    };

    if (description && description !== '') {
      type.description = this.trimMultiLineString(description);
    }

    return type;
  }

  private parseEnumPage(pageContent: string): Enum {
    const $ = this.parseContent(pageContent);
    const realmsRaw = this.trimMultiLineString($('enum > realm').text());
    const realms = this.parseRealms(realmsRaw);
    const description = $('enum > description').html();
    const enumItems: Array<EnumItem> = [];

    $('enum > items')
      .children()
      .each((i, element) => {
        const name = element.attribs.key;
        const value = element.attribs.value;
        const description = $(element).html();

        const enumItem: EnumItem = {
          name: name,
          value: Number(value),
        };

        if (description && description !== '') {
          enumItem.description = this.trimMultiLineString(description);
        }

        enumItems.push(enumItem);
      });

    const _enum: Enum = {
      items: enumItems,
      realms: realms,
    };

    if (description && description !== '') {
      _enum.description = this.trimMultiLineString(description);
    }

    return _enum;
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

  private parseContent(content: string): CheerioStatic {
    return cheerio.load(content, { decodeEntities: false });
  }

  private isPanelPage(pageContent: string): boolean {
    const $ = this.parseContent(pageContent);

    return $('panel').length > 0;
  }

  private isFunctionPage(pageContent: string): boolean {
    const $ = this.parseContent(pageContent);

    return $('function').length > 0;
  }

  private isTypePage(pageContent: string): boolean {
    const $ = this.parseContent(pageContent);

    return $('type').length > 0;
  }

  private isEnumPage(pageContent: string): boolean {
    const $ = this.parseContent(pageContent);

    return $('enum').length > 0;
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
