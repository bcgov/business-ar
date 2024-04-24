# Copyright © 2024 Province of British Columbia
#
# Licensed under the BSD 3 Clause License, (the "License");
# you may not use this file except in compliance with the License.
# The template for the license can be found here
#    https://opensource.org/license/bsd-3-clause/
#
# Redistribution and use in source and binary forms,
# with or without modification, are permitted provided that the
# following conditions are met:
#
# 1. Redistributions of source code must retain the above copyright notice,
#    this list of conditions and the following disclaimer.
#
# 2. Redistributions in binary form must reproduce the above copyright notice,
#    this list of conditions and the following disclaimer in the documentation
#    and/or other materials provided with the distribution.
#
# 3. Neither the name of the copyright holder nor the names of its contributors
#    may be used to endorse or promote products derived from this software
#    without specific prior written permission.
#
# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS “AS IS”
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
# THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
# SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
# POSSIBILITY OF SUCH DAMAGE.
from __future__ import annotations

from contextlib import suppress
from collections.abc import Callable
from functools import wraps
from typing import TypeVar

import firebase_admin
from firebase_admin import auth  # noqa: F401
from flask import current_app
from flask import request
from flask import Response

from ..logging import logger


a = TypeVar("a")

class GoogleAuth:
    def __init__(self, app=None):
        self.app = app
    
    def init_app(self, app):
        self.app = app
        self.app_code = self.app.config.get('APP_CODE', 'Default')

        app_options = None
        if not (self.app.config.get('FIREBASE_AUTH_EMULATOR_HOST', None)):
            self.project_id = self.app.config.get('PROJECT_ID')
            self.api_key = self.app.config.get('API_KEY')
            self.auth_domain = self.app.config.get('AUTH_DOMAIN')
            
            app_options = {
                'apiKey': self.api_key,
                'authDomain': self.auth_domain,
                'projectId': self.project_id
            }

        try:
            self.firebase_app = firebase_admin.get_app(name=self.app_code)
        except Exception as e:
            logger.exception(e)
            self.firebase_app = firebase_admin.initialize_app(
                options=app_options, name=self.app_code
            )

    def verify_jwt(self, request):
        """Verifies a JWT and returns the decoded payload."""

        # Get the JWT from the request header.
        token = request.headers.get("Authorization", "").split(" ")[1]

        # Verify the JWT.
        with suppress(Exception):
            decoded_payload = auth.verify_id_token(token, app=self.firebase_app)
            return decoded_payload

        return None

    def _verify_token(self, request) -> dict:
        """Verifies a JWT and returns the decoded payload."""
        token = request.headers.get("Authorization", "").split(" ")[1]
        try:
            decoded_payload = auth.verify_id_token(token)
        except Exception as e:
            # useful for step debugging
            raise e
        return decoded_payload

    def _has_roles(self, permissions: dict, account_id: str, app_code: str, required_roles: list) -> bool:
        """Checks if the user has the required roles."""
        products = None
        for account in permissions:
            if str(account.get("account_id")) == str(account_id):
                products = account.get("products")
                break
        if not products:
            return False
        
        assigned_roles = None
        for product in products:
            if product.get("product") == app_code:
                assigned_roles = product.get("roles")
                break
        if not assigned_roles:
            return False

        if set(required_roles).issubset(set(assigned_roles.split(','))):
            return True

        return False


# def jwt_authenticated(func: Callable[..., int], roles: list[str] = []) -> Callable[..., int]:
def jwt_authenticated(roles: list[str] = []) -> Callable[..., int]:
    """Use the Firebase Admin SDK to parse Authorization header to verify the
    user ID token.

    The server extracts the Identity Platform uid for that user.
    """
    def decorated(func):
        @wraps(func)
        def decorated_function(*args: a, **kwargs: a) -> a:
            try:
                if not(decoded_token := _verify_token(request)):
                   return Response(status=403, response="Unauthorized")
                
                if not roles:
                    request.uid = decoded_token.get("uid")
                    return func(*args, **kwargs)

                if (app_code := current_app.config.get('APP_CODE')) \
                and (account_id := request.headers.get('x-account-id')) \
                and _has_roles(decoded_token["permissions"],
                               account_id,
                               app_code,
                               roles):
                    request.uid = decoded_token.get("uid")
                    return func(*args, **kwargs)
                
                return Response(status=403, response="Unauthorized")

            except Exception as e:
                logger.exception(e)
                return Response(status=403, response=f"Error with authentication: {e}")
            
        return decorated_function
    return decorated
