from typing import Any


def success(
    message: str,
    data: Any = None,
    *,
    pagination: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Standard success envelope (Nest-style interceptor shape)."""
    body: dict[str, Any] = {
        "message": message,
        "data": data,
    }
    if pagination is not None:
        body["pagination"] = pagination
    return body


def error_body(
    message: str,
    *,
    data: Any = None, 
    errors: Any = None,
) -> dict[str, Any]:
    """Standard error envelope."""
    body: dict[str, Any] = {
        "message": message,
        "data": data,
    }
    if errors is not None:
        body["errors"] = errors
    return body
