# Copyright © 2024 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the 'License');
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an 'AS IS' BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""API endpoints for managing accounts."""

from http import HTTPStatus

from flask import Blueprint, request
from flask_cors import cross_origin

from business_ar_api.common.auth import jwt as _jwt
from business_ar_api.enums.enum import Role
from business_ar_api.exceptions.exceptions import ExternalServiceException
from business_ar_api.exceptions.responses import error_response
from business_ar_api.models import Business
from business_ar_api.services.auth_service import AuthService
from business_ar_api.services.schema_service import SchemaService

bp = Blueprint("KEYS", __name__, url_prefix=f"/v1/user/accounts")


@bp.route("", methods=["GET", "OPTIONS"])
@cross_origin(origins="*", methods=["GET"])
@_jwt.has_one_of_roles([Role.STAFF_MANAGE_ACCOUNTS.value, Role.ACCOUNT_HOLDER.value])
def get_user_accounts():
    """Get all accounts of the user."""
    auth_service = AuthService()
    try:
        return auth_service.get_user_accounts(), HTTPStatus.OK
    except ExternalServiceException as service_exception:
        return error_response(service_exception.message, service_exception.status_code)


@bp.route("", methods=["POST", "OPTIONS"])
@cross_origin(origins="*", methods=["POST"])
@_jwt.has_one_of_roles([Role.STAFF_MANAGE_ACCOUNTS.value, Role.ACCOUNT_HOLDER.value])
def create_user_account():
    """Create a new user account."""
    auth_service = AuthService()
    json_input = request.get_json()

    schema_name = "new-account.json"
    schema_service = SchemaService()
    [valid, errors] = schema_service.validate(schema_name, json_input)
    if not valid:
        return error_response("Invalid request", HTTPStatus.BAD_REQUEST, errors)
    try:
        return auth_service.create_user_account(json_input), HTTPStatus.OK
    except ExternalServiceException as service_exception:
        return error_response(service_exception.message, service_exception.status_code)


@bp.route("/<int:account_id>/affiliate", methods=["POST", "OPTIONS"])
@cross_origin(origins="*", methods=["POST"])
@_jwt.has_one_of_roles([Role.STAFF_MANAGE_ACCOUNTS.value, Role.ACCOUNT_HOLDER.value])
def create_and_affiliate_entity(account_id: str):
    """Create a new entity and affiliate it to the account."""
    auth_service = AuthService()
    json_input = request.get_json()
    business_identifier = json_input.get("businessIdentifier")

    if not business_identifier:
        return error_response(
            "Please provide businessIdentifier", HTTPStatus.BAD_REQUEST
        )

    business: Business = Business.find_by_identifier(business_identifier)
    if not business:
        return error_response(f"{business_identifier} not found", HTTPStatus.NOT_FOUND)

    entity_json = {
        "businessIdentifier": business.identifier,
        "name": business.legal_name,
        "corpTypeCode": business.legal_type,
    }

    try:
        # Step 1: Create Entity
        auth_service.create_entity(entity_json)

        # Step 2: Affiliate the new entity to the account.
        return (
            auth_service.affiliate_entity_to_account(account_id, business_identifier),
            HTTPStatus.OK,
        )
    except ExternalServiceException as service_exception:
        return error_response(service_exception.message, service_exception.status_code)
