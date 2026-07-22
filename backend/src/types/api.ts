export type ApiResponse<T = unknown> = {
  success: boolean;
  message: string;
  data: T | null;
  errors: string[];
};

export type AuthenticatedRequest = {
  user?: {
    id: string;
    email: string;
    role: string;
  };
};
