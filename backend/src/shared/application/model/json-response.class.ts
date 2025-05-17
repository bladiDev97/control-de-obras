export class JsonResponse<T> {
  public succeed: boolean;
  public data: T;
  public message: string;
  public created: Date;

  constructor(obj: IJsonResponse) {
    const { succeed, data, message } = obj;
    this.succeed = succeed ? succeed : true;
    this.created = new Date();
    this.message = message;
    this.data = data as T;
  }
}

interface IJsonResponse {
  succeed?: boolean;
  data: unknown;
  message?: string;
}
