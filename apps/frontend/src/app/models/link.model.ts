export type Link = {
  code: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
  expiresAt: string;
};

export type ApiError = {
  statusCode: number;
  message: string;
  error: string;
};
