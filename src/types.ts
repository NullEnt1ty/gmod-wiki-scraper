export type Realm = 'client' | 'menu' | 'server';

export interface PagePreviewResponse {
  status: string;
  html: string;
  title: string | null;
}

export interface PageLink {
  url: string;
  label: string;
  icon: string;
  description: string;
}

export interface PageJsonResponse {
  title: string;
  wikiName: string;
  wikiIcon: string;
  wikiUrl: string;
  address: string;
  createdTime: string;
  updatedCount: number;
  markup: string;
  html: string;
  footer: string;
  revisionId: number;
  pageLinks: Array<PageLink>;
}

export interface WikiPage {
  title: string;
  content: string;
}

export interface FunctionArgument {
  name: string;
  type: string;
  default?: string;
  description?: string;
}

export interface FunctionReturnValue {
  name?: string;
  type: string;
  description?: string;
}

export interface FunctionPage {
  name: string;
  parent: string;
  description?: string;
  realms: Array<Realm>;
  arguments?: Array<FunctionArgument>;
  returnValues?: Array<FunctionReturnValue>;
}
