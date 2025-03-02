export interface ControllerResponseDataType {
  status: number;
  message: string;
  details: any[];
}

export interface ServiceResponseDataType {
  success: boolean;
  status: number;
  message: string;
  details: any[];
}

export const ControllerResponse = (
  status: number,
  message: string,
  details: any,
): ControllerResponseDataType => ({
  status,
  message,
  details,
});
