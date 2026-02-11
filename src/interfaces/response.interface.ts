export interface IErrorResponse {
  message: string;
  stack?: string;
}

export interface ISuccessResponse {
  Success: true;
  message: string;
  [key: string]: any;
}
