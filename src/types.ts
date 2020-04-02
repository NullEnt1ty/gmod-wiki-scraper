export interface PagePreviewResponse {
  status: string;
  html: string;
  title: string | null;
}

export interface FunctionArgument {
  name: string;
  type: string;
  default?: any;
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
  realm: string;
  arguments?: Array<FunctionArgument>;
  returnValues?: Array<FunctionReturnValue>;
}
