export class AppError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
  }
}

export const notFound = () => new AppError('Render not found', 404, 'not_found');
