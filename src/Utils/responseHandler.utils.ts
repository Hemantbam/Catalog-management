import { Injectable } from '@nestjs/common';

interface ResponseData {
  success: boolean;
  status: number;
  message: string;
  details: any[] | null;
}

@Injectable()
export class ResponseHandler {
  private createResponse(
    success: boolean,
    status: number,
    message: string,
    details: any[] | null = null,
  ): ResponseData {
    return {
      success,
      status,
      message,
      details: details || null,
    };
  }

  conflictResponse(message: string): ResponseData {
    return this.createResponse(false, 409, message, null);
  }

  notFoundResponse(message: string): ResponseData {
    return this.createResponse(false, 404, message, null);
  }

  successResponse(message: string, data: any = null): ResponseData {
    return this.createResponse(
      true,
      200,
      message,
      Array.isArray(data) ? data : data ? [data] : null,
    );
  }

  badRequestResponse(message: string): ResponseData {
    return this.createResponse(false, 400, message, null);
  }

  unexpectedErrorResponse(details: any = null): ResponseData {
    return this.createResponse(
      false,
      500,
      'Internal server error',
      details ? [details] : null,
    );
  }
}
