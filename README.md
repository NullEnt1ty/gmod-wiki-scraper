# GMod Wiki Scraper

This application allows you to scrape the **new** Garry's Mod wiki which can be
accessed via https://wiki.facepunch.com/gmod/.

## Prerequisites

- Node.js `>= 12.9`
- npm `>= 5`

npm often comes bundled with Node.js so you probably won't need to install that
separately.

## Installation

```
npm install -g gmod-wiki-scraper
```

## Usage

```
gmod-wiki-scraper
```

This will retrieve all functions, hooks, enums, etc. from the wiki and save
them as JSON files into an output directory in your current working directory.

It is currently not possible to retrieve single functions or categories. There
might be a CLI to allow this in the future.

## API

### Documentation

WIP

### Examples

#### Retrieving a single page

This will retrieve the content of [Global.Entity](https://wiki.facepunch.com/gmod/Global.Entity) and parse it.

```typescript
import { WikiApiClient, WikiScraper } from 'gmod-wiki-scraper';

(async (): Promise<void> => {
  const client = new WikiApiClient();
  const scraper = new WikiScraper(client);

  const page = await client.retrievePage('Global.Entity')
  const parsedFunctionPage = scraper.parseFunctionPage(page.content);

  console.log(parsedFunctionPage);
})();
```

Output:

```json
{
  name: 'Entity',
  parent: 'Global',
  realms: [ 'client', 'server' ],
  description: 'Returns the entity with the matching <page>Entity:EntIndex</page>.\n' +
    '\n' +
    'Indices 1 through <page>game.MaxPlayers</page>() are always reserved for players.\n' +
    '\n' +
    "<note>In examples on this wiki, **Entity( 1 )** is used when a player entity is needed (see ). In singleplayer and listen servers, **Entity( 1 )** will always be the first player. In dedicated servers, however, **Entity( 1 )** won't always be a valid player.</note>",
  arguments: [
    {
      name: 'entityIndex',
      type: 'number',
      description: 'The entity index.'
    }
  ],
  returnValues: [
    {
      type: 'Entity',
      description: "The entity if it exists, or NULL if it doesn't."
    }
  ]
}
```
