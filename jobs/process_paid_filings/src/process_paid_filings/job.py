# Copyright © 2024 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Job to process paid filings.
"""
import logging
import json
import os
from typing import List
from datetime import datetime
import pytz

import requests
import sentry_sdk
from business_ar_api.enums.enum import AuthHeaderType
from business_ar_api.services import AccountService
from business_ar_api.models import ColinEventId, db
from flask import Flask
from sentry_sdk.integrations.logging import LoggingIntegration

from .config import CONFIGURATION
from .utils.logging import initialize_logging

initialize_logging(os.path.join(os.path.abspath(os.path.dirname(__file__)), "logging.conf"))

SENTRY_LOGGING = LoggingIntegration(event_level=logging.ERROR)  # send errors as events
CONTENT_TYPE_JSON = {"Content-Type": "application/json"}
TIMEOUT = 300


def create_app(run_mode=os.getenv("FLASK_ENV", "production")):
    """Return a configured Flask App using the Factory method."""
    app = Flask(__name__)
    app.config.from_object(CONFIGURATION[run_mode])
    db.init_app(app)
    # Configure Sentry
    if app.config.get("SENTRY_DSN", None):
        sentry_sdk.init(dsn=app.config.get("SENTRY_DSN"), integrations=[SENTRY_LOGGING])

    register_shellcontext(app)

    return app


def register_shellcontext(app):
    """Register shell context objects."""

    def shell_context():
        """Shell context objects."""
        return {"app": app}

    app.shell_context_processor(shell_context)


def get_filings(app: Flask = None, token: str = None):
    """Get a filing with filing_id."""
    req = requests.get(
        f'{app.config["BUSINESS_AR_API_URL"]}/internal/filings/paid',
        headers={
            **CONTENT_TYPE_JSON,
            "Authorization": AuthHeaderType.BEARER.value.format(token),
        },
        timeout=TIMEOUT,
    )
    if not req or req.status_code != 200:
        app.logger.error(
            f"Failed to collect filings from legal-api. {req} {req.status_code}"
        )
        raise Exception  # pylint: disable=broad-exception-raised
    return req.json()


def send_filing(
    app: Flask = None, filing: dict = None, filing_id: str = None, token: str = None
):
    """Post to colin-api with filing."""
    clean_none(filing)

    filing_type = filing["filing"]["header"].get("name", None)
    identifier = filing["filing"]["business"].get("identifier", None)
    legal_type = filing["filing"]["business"].get("legalType")

    req = None
    if legal_type and identifier and filing_type:
        req = requests.post(
            f'{app.config["COLIN_API_URL"]}/businesses/{legal_type}/{identifier}/filings/{filing_type}',
            headers={
                **CONTENT_TYPE_JSON,
                "Authorization": AuthHeaderType.BEARER.value.format(token),
            },
            json=filing,
            timeout=TIMEOUT,
        )

    if not req or req.status_code != 201:
        app.logger.error(f"Filing {filing_id} not created in colin {identifier}.")
        return None

    # if it's an AR containing multiple filings it will have multiple colinIds
    return req.json()["filing"]["header"]["colinIds"]


def complete_filing(app: Flask, filing_id: str, colin_ids: List[int], token: str):
    try:
        data = {"colinEventIds": colin_ids}
        req = requests.patch(
            url=f'{app.config["BUSINESS_AR_API_URL"]}/internal/filings/{filing_id}',
            data=json.dumps(data),
            headers={
                **CONTENT_TYPE_JSON,
                "Authorization": AuthHeaderType.BEARER.value.format(token),
            },
            timeout=TIMEOUT,
        )
        if not req or req.status_code != 200:
            app.logger.error(
                f"Failed to complete filing {filing_id} with colin id {colin_ids}"
            )
    except Exception as exception:
        app.logger.error(
            f"Failed to complete filing {filing_id} with colin id {colin_ids}",
            exception,
        )


def delete_ar_prompt(app: Flask, legal_type: str, identifier: str, token: str):
    """Delete AR Prompt for corporation."""
    try:
        # Log the identifier and token for debugging purposes
        app.logger.info(f"Attempting to delete AR prompt for corporation {identifier}.")
        app.logger.debug(f"Token used for deletion: {token}")

        # Make the DELETE request to the COLIN API
        req = requests.delete(
            f'{app.config["COLIN_API_URL"]}/businesses/{legal_type}/{identifier}/filings/reminder',
            headers={
                **CONTENT_TYPE_JSON,
                "Authorization": AuthHeaderType.BEARER.value.format(token),
            },
            timeout=TIMEOUT,
        )

        # Log the response status and content
        if req.status_code == 200:
            app.logger.info(f"Successfully deleted AR prompt for corporation {identifier}.")
        else:
            app.logger.error(f"Failed to delete AR prompt for corporation {identifier}. "
                             f"Status code: {req.status_code}, Response: {req.text}")
    except Exception as exception:
        # Log the exception with full traceback details
        app.logger.error(f"Error deleting AR prompt for corporation {identifier}: {str(exception)}", exc_info=True)


def send_email(app: Flask, filing_id: str, token: str):
    try:
        req = requests.post(
            url=f'{app.config["BUSINESS_AR_API_URL"]}/internal/filings/{filing_id}/notify',
            headers={
                **CONTENT_TYPE_JSON,
                "Authorization": AuthHeaderType.BEARER.value.format(token),
            },
            timeout=TIMEOUT,
        )
        if not req or req.status_code != 200:
            app.logger.error(f"Failed to send email for filing {filing_id}")
    except Exception as exception:
        app.logger.error(f"Failed to send email for filing {filing_id}: {exception}")


def clean_none(dictionary: dict = None):
    """Replace all none values with empty string."""
    for key in dictionary.keys():
        if dictionary[key]:
            if isinstance(dictionary[key], dict):
                clean_none(dictionary[key])
        elif dictionary[key] is None:
            dictionary[key] = ""


def run():
    """Get filings that haven't been synced with colin and send them to the colin-api."""
    application = create_app()
    corps_with_failed_filing = []
    with application.app_context():
        try:
            client_id = application.config.get("COLIN_API_SVC_CLIENT_ID")
            client_secret = application.config.get("COLIN_API_SVC_CLIENT_SECRET")
            token = AccountService.get_service_client_token(client_id, client_secret)
            filings_res = get_filings(app=application, token=token)
            filings = filings_res.get("filings")
            if not filings:
                # pylint: disable=no-member; false positive
                application.logger.debug("No completed filings to send to colin.")
            for filing in filings:
                filing_id = filing["filing"]["header"]["id"]
                identifier = filing["filing"]["business"]["identifier"]
                legal_type = filing["filing"]["business"]["legalType"]
                filing["filing"]["header"]["learEffectiveDate"] = filing["filing"][
                    "header"
                ]["filingDateTime"]
                filing["filing"]["header"]["date"] = filing["filing"]["header"]["learEffectiveDate"]
                filing["filing"]["header"]["certifiedBy"] = filing["filing"]["header"]["certifiedByDisplayName"]
                filing["filing"]["header"]["submitter"] = filing["filing"]["header"]["certifiedByDisplayName"]
                filing["filing"]["header"]["source"] = "BAR"

                # Convert the founding date from UTC to Pacific Time.
                # The Colin API sends the founding date in UTC, but we need to convert it
                # back to the local Pacific Time zone to ensure the last_ar_filed_date reflects
                # the same calendar day locally as when the business was founded.
                utc_founding_date = (
                    datetime.fromisoformat(filing["filing"]["business"]["foundingDate"])
                    .replace(tzinfo=pytz.utc)
                )
                pacific_founding_date = utc_founding_date.astimezone(pytz.timezone('America/Los_Angeles'))
                filing["filing"]["business"]["foundingDate"] = pacific_founding_date.isoformat()

                application.logger.info(
                    f"The occurances of filing_id {filing_id} in colin_event_ids table \
                    is {len(ColinEventId.get_by_filing_id(filing_id))}"
                )

                if identifier in corps_with_failed_filing or len(ColinEventId.get_by_filing_id(filing_id)) > 0:
                    # pylint: disable=no-member; false positive
                    application.logger.debug(
                        f"Skipping filing {filing_id} for"
                        f' {filing["filing"]["business"]["identifier"]}.'
                    )
                else:
                    colin_ids = send_filing(
                        app=application, filing=filing, filing_id=filing_id, token=token
                    )
                    if colin_ids:
                        application.logger.info(
                            f"Successfully filed {filing_id}. Colin id {colin_ids}"
                        )
                        # Call Patch endpoint to mark the filing as complete.
                        complete_filing(
                            app=application,
                            filing_id=filing_id,
                            colin_ids=colin_ids,
                            token=token,
                        )
                        send_email(
                            app=application,
                            filing_id=filing_id,
                            token=token,
                        )
                        delete_ar_prompt(
                            app=application,
                            legal_type=legal_type,
                            identifier=identifier,
                            token=token)
                    else:
                        corps_with_failed_filing.append(
                            filing["filing"]["business"]["identifier"]
                        )
                        # pylint: disable=no-member; false positive
                        application.logger.error(
                            f"Failed to update filing {filing_id} with colin event id."
                        )

        except Exception as err:  # noqa: B902
            # pylint: disable=no-member; false positive
            application.logger.error(err)
