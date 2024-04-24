from __future__ import annotations

from collections.abc import Callable
from functools import wraps
from typing import TypeVar

from flask import Flask
from flask import Response
from flask import request

from ..logging import logger
from .exceptions import AppNotConfiguredException
from .exceptions import MissingCredentialsException
from .gcip_auth import GoogleAuth

args = TypeVar("args")
kwargs = TypeVar("kwargs")
ret = TypeVar("ret")
a = TypeVar("a")

class SBCAuthManager:

    def __init__(self, app: Flask = None):

        self.google_auth = GoogleAuth()

        if app is not None:
            self.init_app(app)

    def init_app(self, app: Flask):
        if not app:
            raise AppNotConfiguredException('No Flask App provided.')
        
        self.app = app
        self.google_auth.init_app(app)

    def jwt_authenticated(self, func: Callable[..., int]) -> Callable[..., int]:

        @wraps(func)
        def decorated_function(*args: a, **kwargs: a) -> a:
            try:
                if not (header := request.headers.get("Authorization", None)):
                    raise MissingCredentialsException()
                
                if not(self.google_auth.verify_jwt(request)):
                    raise MissingCredentialsException()

            except Exception as e:
                logger.exception(e)
                return Response(status=403, response=f"Error with authentication: {e}")
             
            return func(*args, **kwargs)
        return decorated_function
