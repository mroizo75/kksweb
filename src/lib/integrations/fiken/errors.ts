export class FikenConfigError extends Error {
  readonly code = "not_configured";

  constructor() {
    super("Fiken er ikke koblet til. En administrator må koble til Fiken under Faktura.");
    this.name = "FikenConfigError";
  }
}

export class FikenApiError extends Error {
  readonly code = "fiken_error";

  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "FikenApiError";
  }
}
