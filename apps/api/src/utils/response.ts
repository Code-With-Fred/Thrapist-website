import { Response } from 'express';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function successResponse(
  res: Response,
  data: unknown,
  message?: string,
  statusCode = 200,
  pagination?: PaginationMeta,
) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    ...(pagination && { pagination }),
  });
}

export function errorResponse(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown[],
) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
}

export function paginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit),
  };
}
