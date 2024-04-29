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
"""
This module defines filing endpoints.

It provides endpoints to create and retrieve filing objects.

"""
from http import HTTPStatus

from flask import Blueprint, g, jsonify, request
from flask_cors import cross_origin
from typing import Optional

from business_ar_api.common.auth import jwt
from business_ar_api.exceptions.responses import error_response
from business_ar_api.exceptions import exception_response, AuthException
from business_ar_api.models import User as UserModel
from business_ar_api.services import (
    SchemaService,
    FilingService,
    AuthService,
    BusinessService,
    PaymentService,
)

bp = Blueprint(
    "filing", __name__, url_prefix=f"/v1/business/<string:identifier>/filings"
)


@bp.route("/", methods=["GET"])
@bp.route("/<int:filing_id>", methods=["GET"])
@cross_origin(origin="*")
@jwt.requires_auth
def get_filings(identifier: str, filing_id: Optional[int] = None):
    """Get the filings, or specific filing by id."""
    try:
        business = BusinessService.find_by_business_identifier(identifier)
        if not business:
            return error_response(f"No matching business.", HTTPStatus.NOT_FOUND)

        AuthService.is_authorized(business_identifier=identifier)

        if filing_id:
            filing = FilingService.find_filing_by_id(filing_id)
            return jsonify(FilingService.serialize(filing)), HTTPStatus.OK
        else:
            filings = FilingService.find_filings_by_business_id(business.id)
            filings_res = []
            for filing in filings:
                filings_res.append(FilingService.serialize(filing))
            return jsonify(filings=filings_res), HTTPStatus.OK

    except AuthException as aex:
        return exception_response(aex)
    except Exception as exception:  # noqa: B902
        return exception_response(exception)


@bp.route("/", methods=["POST"])
@cross_origin(origin="*")
@jwt.requires_auth
def create_filing(identifier):
    """
    Create a new filing.

    Returns:
        A tuple containing the response JSON and the HTTP status code.
    """
    try:
        user = UserModel.get_or_create_user_by_jwt(g.jwt_oidc_token_info)
        account_id = request.headers.get("Account-Id", None)

        json_input = request.get_json()

        business = BusinessService.find_by_business_identifier(identifier)
        if not business:
            return error_response(f"No matching business.", HTTPStatus.NOT_FOUND)

        # TODO: validate payload.
        schema_name = "ar-filing.json"
        schema_service = SchemaService()
        [valid, errors] = schema_service.validate(schema_name, json_input)
        if not valid:
            return error_response("Invalid request", HTTPStatus.BAD_REQUEST, errors)

        # Check whether the user has permission to create the filing.
        AuthService.is_authorized(business_identifier=identifier)

        # create filing
        filing = FilingService.create_filing(json_input, business.id, user.id)

        # create invoice in pay system
        invoice_resp = PaymentService.create_invoice(account_id, jwt, business.json())

        # Update the filing with the payment token save it in the db.
        filing = FilingService.update_filing_invoice_details(
            filing.id, invoice_resp.json()["id"]
        )

        return jsonify(FilingService.serialize(filing)), HTTPStatus.CREATED

    except AuthException as authException:
        return exception_response(authException)
    except Exception as exception:  # noqa: B902
        return exception_response(exception)


@bp.route("/<int:filing_id>/payment", methods=["PUT"])
@cross_origin(origin="*")
@jwt.requires_auth
def update_filing_payment_status(identifier, filing_id):
    """
    Update the payment information of a filing by pulling data from sbc-pay.

    Returns:
        A tuple containing the response JSON and the HTTP status code.
    """
    try:
        if not filing_id:
            return error_response(
                f"Please provide the filing id.", HTTPStatus.BAD_REQUEST
            )

        business = BusinessService.find_by_business_identifier(identifier)
        if not business:
            return error_response(f"No matching business.", HTTPStatus.NOT_FOUND)

        # Check whether the user has permission to update the filing.
        AuthService.is_authorized(business_identifier=identifier)

        # update filing with payment details
        filing = FilingService.update_payment_data(filing_id, jwt)

        return jsonify(FilingService.serialize(filing)), HTTPStatus.OK

    except AuthException as authException:
        return exception_response(authException)
    except Exception as exception:  # noqa: B902
        return exception_response(exception)
