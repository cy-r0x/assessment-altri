class AppError(Exception):
    """Domain/API error that maps to a consistent JSON envelope."""

    def __init__(self, message: str, *, status_code: int = 400, data=None, errors=None) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.data = data
        self.errors = errors
