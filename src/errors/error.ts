export class AppError extends Error {
  public status: number;
  public details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = this.constructor.name; // to extract name of error class itself
    this.status = status;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: unknown) {
    super(message, 400, details);
  }
}
