export interface IErrorResponse {
  message: string;
  stack?: string;
  extra:Object
}

export interface ISuccessResponse {
  Success: true;
  message: string;
  [key: string]: any;
}
