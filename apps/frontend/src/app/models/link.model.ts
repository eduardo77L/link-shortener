export type Link = {
  code: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
};

export type ApiError = {
  statusCode: number;
  message: string;
  error: string;
};
