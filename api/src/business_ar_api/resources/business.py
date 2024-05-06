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
"""API endpoints for managing business."""

from http import HTTPStatus

from flask import Blueprint, request
from flask_cors import cross_origin

from business_ar_api.common.auth import jwt as _jwt
from business_ar_api.enums.enum import Role
from business_ar_api.exceptions.exceptions import ExternalServiceException
from business_ar_api.exceptions.responses import error_response
from business_ar_api.models import Business as BusinessModel
from business_ar_api.services import AccountService, BusinessService

bp = Blueprint("business_keys", __name__, url_prefix=f"/v1/business")


@bp.route("/token/<string:token>", methods=["GET"])
@cross_origin(origin="*")
def get_business_details_using_token(token):
    """Get business details using nano id."""
    if not token:
        return error_response("Please provide token.", HTTPStatus.BAD_REQUEST)

    business: BusinessModel = BusinessModel.find_by_nano_id(token)
    if not business:
        return error_response(f"No matching business.", HTTPStatus.NOT_FOUND)
    return business.json(), HTTPStatus.OK


@bp.route("/<string:identifier>", methods=["GET"])
@cross_origin(origin="*")
def get_business_details(identifier):
    """Get business details from colin"""
    if not identifier:
        return error_response(
            "Please provide business identifier.", HTTPStatus.BAD_REQUEST
        )

    business: BusinessModel = BusinessService.find_by_business_identifier(identifier)
    if not business:
        return error_response(f"No matching business.", HTTPStatus.NOT_FOUND)

    business_details = BusinessService.get_business_details_from_colin(
        business.identifier, business.legal_type
    )

    return business_details, HTTPStatus.OK


@bp.route("/auth", methods=["POST"])
@cross_origin(origin="*")
@_jwt.has_one_of_roles([Role.STAFF_MANAGE_ACCOUNTS.value, Role.ACCOUNT_HOLDER.value])
def create_business_in_auth():
    """Create Business in sbc-auth."""

    json_input = request.get_json()
    business_identifier = json_input.get("businessIdentifier")

    if not business_identifier:
        return error_response(
            "Please provide business identifier", HTTPStatus.BAD_REQUEST
        )

    business: BusinessModel = BusinessModel.find_by_identifier(business_identifier)
    if not business:
        return error_response(f"{business_identifier} not found", HTTPStatus.NOT_FOUND)

    entity_json = {
        "businessIdentifier": business.identifier,
        "name": business.legal_name,
        "corpTypeCode": business.legal_type,
    }

    try:
        return AccountService.create_entity(entity_json), HTTPStatus.CREATED
    except ExternalServiceException as service_exception:
        return error_response(service_exception.message, service_exception.status_code)
