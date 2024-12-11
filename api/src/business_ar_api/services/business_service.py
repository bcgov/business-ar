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
"""Business Service."""
from datetime import date, datetime
from http import HTTPStatus
import pytz
from pytz import timezone

from flask import current_app
from business_ar_api.exceptions.exceptions import BusinessException
from business_ar_api.models import Business as BusinessModel
from business_ar_api.models import Filing as FilingModel
from business_ar_api.models.filing import FilingSerializer
from business_ar_api.services import AccountService
from business_ar_api.services.invitation_service import InvitationService
from business_ar_api.services.rest_service import RestService


class BusinessService:
    """Business Service."""
    @classmethod
    def find_by_business_identifier(cls, business_identifier: str) -> BusinessModel:
        """Finds a business by its identifier"""
        return BusinessModel.find_by_identifier(business_identifier)

    @classmethod
    def find_by_internal_id(cls, business_id: int) -> BusinessModel:
        """Finds a business by its internal id."""
        return BusinessModel.find_by_id(business_id)

    @classmethod
    def get_business_details_from_colin(cls, identifier: str, legal_type: str, business_id: int) -> dict:
        """Get the business details from Colin."""
        client_id = current_app.config.get("COLIN_API_SVC_CLIENT_ID")
        client_secret = current_app.config.get("COLIN_API_SVC_CLIENT_SECRET")
        colin_business_identifier = identifier[2:] if identifier.startswith("BC", 0, 2) else identifier
        colin_api_endpoint = (
            f"{current_app.config.get('COLIN_API_URL')}/businesses/{legal_type}/{colin_business_identifier}"
        )

        token = AccountService.get_service_client_token(client_id, client_secret)

        if not token:
            raise BusinessException(
                error="Unable to get a token",
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            )

        business_details = RestService.get(endpoint=colin_api_endpoint, token=token).json()

        # Convert founding date from UTC to Pacific Time when getting from Colin
        if business_details and "foundingDate" in business_details.get("business", {}):
            utc_founding_date = datetime.fromisoformat(
                business_details["business"]["foundingDate"]
            ).replace(tzinfo=pytz.utc)
            pacific_tz = timezone("America/Los_Angeles")
            pacific_founding_date = utc_founding_date.astimezone(pacific_tz)
            business_details["business"]["foundingDate"] = pacific_founding_date.isoformat()
            # Add a flag to indicate timezone is already Pacific
            business_details["business"]["foundingDateTz"] = "America/Los_Angeles"

        if business_details:
            business_details["business"]["nextARYear"] = BusinessService._get_next_ar_year(business_details)

        if "businessNumber" in business_details.get("business"):
            business_details["business"]["taxId"] = business_details["business"]["businessNumber"]
            del business_details["business"]["businessNumber"]

        active_invitations = InvitationService.find_active_invitation_by_business(business_id)
        if active_invitations:
            business_details["business"]["invitationEmail"] = active_invitations[0].recipients

        # Check for any unsynced filings in GCP and adjust
        next_ar_year_gcp = FilingModel.get_next_ar_fiscal_year(business_id)
        next_ar_adjustment = next_ar_year_gcp and next_ar_year_gcp >= business_details["business"]["nextARYear"]
        if next_ar_adjustment:
            last_ar_date_gcp = FilingModel.get_last_ar_filed_date(business_id)
            business_details["business"]["nextARYear"] = next_ar_year_gcp
            business_details["business"]["lastArDate"] = datetime.strptime(last_ar_date_gcp, "%Y-%m-%d").strftime(
                "%Y-%m-%d"
            )

        # Check for any future effective filings, ignoring ones due to unsynced filings in GCP
        fed_filings_endpoint = (
            f"{current_app.config.get('COLIN_API_URL')}/businesses/{legal_type}/"
            f"{colin_business_identifier}/filings/future"
        )
        fed_filings = RestService.get(endpoint=fed_filings_endpoint, token=token).json()
        business_details["business"]["hasFutureEffectiveFilings"] = (
            True if fed_filings and len(fed_filings) > 0 and not next_ar_adjustment else False
        )
        if (
            next_ar_year_gcp and next_ar_year_gcp > datetime.now().year
        ):  # Ignore when filings are up to date (will trigger different error)
            business_details["business"]["hasFutureEffectiveFilings"] = False

        return business_details

    @classmethod
    def get_business_party_details_from_colin(cls, identifier: str, legal_type: str) -> dict:
        """Get the business party details from Colin."""
        client_id = current_app.config.get("COLIN_API_SVC_CLIENT_ID")
        client_secret = current_app.config.get("COLIN_API_SVC_CLIENT_SECRET")
        colin_business_identifier = identifier[2:] if identifier.startswith("BC", 0, 2) else identifier
        colin_api_endpoint = (
            f"{current_app.config.get('COLIN_API_URL')}/businesses/{legal_type}/{colin_business_identifier}/parties"
        )

        token = AccountService.get_service_client_token(client_id, client_secret)

        if not token:
            raise BusinessException(
                error="Unable to get a token",
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            )

        business_parties = RestService.get(endpoint=colin_api_endpoint, token=token).json()

        return business_parties

    @classmethod
    def get_business_office_details_from_colin(cls, identifier: str, legal_type: str) -> dict:
        """Get the business office details from Colin."""
        client_id = current_app.config.get("COLIN_API_SVC_CLIENT_ID")
        client_secret = current_app.config.get("COLIN_API_SVC_CLIENT_SECRET")
        colin_business_identifier = identifier[2:] if identifier.startswith("BC", 0, 2) else identifier
        colin_api_endpoint = (
            f"{current_app.config.get('COLIN_API_URL')}/businesses/{legal_type}/{colin_business_identifier}/office"
        )

        token = AccountService.get_service_client_token(client_id, client_secret)

        if not token:
            raise BusinessException(
                error="Unable to get a token",
                status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
            )

        business_offices = RestService.get(endpoint=colin_api_endpoint, token=token).json()

        return business_offices

    @classmethod
    def _get_next_ar_year(cls, business_details: dict) -> int:
        """Get the next AR year."""
        next_ar_year = -1
        last_ar_date_string = business_details.get("business", {}).get("lastArDate", None)
        founding_date_string = business_details.get("business", {}).get("foundingDate", None)
        if last_ar_date_string:
            last_ar_date = datetime.strptime(last_ar_date_string, "%Y-%m-%d")
            next_ar_year = last_ar_date.year + 1
        elif founding_date_string:
            founding_date: date = datetime.fromisoformat(founding_date_string).date()
            next_ar_year = founding_date.year + 1
        return next_ar_year

    @classmethod
    def get_business_pending_tasks(cls, business_identifier: int) -> dict:
        """Get the business pending tasks."""
        tasks = []
        business = BusinessService.find_by_business_identifier(business_identifier)
        if not business:
            raise BusinessException(error="Business not found", status_code=HTTPStatus.NOT_FOUND)

        business_details_dict = BusinessService.get_business_details_from_colin(
            business.identifier, business.legal_type, business.id
        ).get("business", {})

        # Retrieve Incomplete filings
        incomplete_filings = FilingModel.find_business_filings_by_status(
            business.id,
            [
                FilingModel.Status.DRAFT,
                FilingModel.Status.PENDING,
            ],
        )

        # Create a todo item for each incomplete filing
        for filing in incomplete_filings:
            filing_json = FilingSerializer.to_dict(filing)
            filing_json["filing"]["business"] = business_details_dict
            task = {"task": filing_json}
            tasks.append(task)

        # Create a todo item for the next ar year
        if not tasks:
            next_ar_year = business_details_dict.get("nextARYear")
            if next_ar_year and next_ar_year <= datetime.utcnow().year:
                tasks.append(BusinessService._create_todo(business_details_dict))
        return tasks

    @classmethod
    def _create_todo(cls, business_details: dict):
        """Return a to-do JSON object."""

        todo = {
            "task": {
                "todo": {
                    "business": business_details,
                    "header": {
                        "name": "annualReport",
                        "ARFilingYear": business_details.get("nextARYear"),
                        "status": "NEW",
                    },
                }
            }
        }
        return todo
