export type Realm = 'client' | 'menu' | 'server';

export interface PagePreviewResponse {
  status: string;
  html: string;
  title: string | null;
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
  description?: string;
  realms: Array<Realm>;
  arguments?: Array<FunctionArgument>;
  returnValues?: Array<FunctionReturnValue>;
}
