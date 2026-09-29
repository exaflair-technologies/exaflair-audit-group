/** An error a service raises on purpose, carrying the HTTP status the API should answer with. */
export class ServiceError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

export const notFound = (what: string) => new ServiceError(404, "NOT_FOUND", `${what} not found`);

export const badRequest = (message: string) => new ServiceError(400, "BAD_REQUEST", message);
