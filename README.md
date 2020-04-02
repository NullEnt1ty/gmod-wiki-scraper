# GMod Wiki Scraper

This application allows you to scrape the **new** Garry's Mod wiki which can be
accessed via https://wiki.facepunch.com/gmod/.

**Heads up!** This project is still in an early stage of development. It is
incomplete and should not be used in production. Contributions are always
welcome!

## Prerequisites

- Node.js `>= 12.9`
- npm `>= 5`

npm often comes bundled with Node.js so you probably won't need to install that
separately.

## Installation

1. Clone this repository
   ```
   git clone https://github.com/NullEnt1ty/gmod-wiki-scraper.git
   ```
1. Install dependencies
   ```
   npm install
   ```

## Usage

```
npm start
```

This will retrieve all functions, hooks, enums, etc. from the wiki and save
them as JSON files into an output directory in your current working directory.

It is currently not possible to retrieve single functions or categories. There
might be a CLI to allow this in the future.
