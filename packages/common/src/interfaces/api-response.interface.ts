export interface ApiResponseMetadata {
  timestamp: string;
  traceId: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  metadata: ApiResponseMetadata;
}

export interface ApiErrorDetail {
  field?: string;
  issue: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details: ApiErrorDetail[];
  };
  metadata: ApiResponseMetadata;
}
