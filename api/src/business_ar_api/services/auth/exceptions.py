
class AuthException(Exception):
    """Base class for all authentication exceptions."""

class AppNotConfiguredException(AuthException):
    """Raised when the application is not configured correctly."""

class InvalidCredentialsException(AuthException):
    """Raised when the provided credentials are invalid."""

class MissingCredentialsException(AuthException):
    """Raised when the required credentials are missing."""

class ExpiredCredentialsException(AuthException):
    """Raised when the provided credentials have expired."""

class UnauthorizedException(AuthException):
    """Raised when the user is not authorized to access the requested resource."""

class ForbiddenException(AuthException):
    """Raised when the user is forbidden from accessing the requested resource."""
