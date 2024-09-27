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
"""Job to send AR reminder.
"""
import os
from datetime import datetime
from pathlib import Path
from http import HTTPStatus

import requests
from flask import Flask
from jinja2 import Template
from nanoid import generate
from sqlalchemy.sql.expression import text  # noqa: I001
from business_ar_api.enums.enum import AuthHeaderType
from business_ar_api.models import AnnualReportReminder, Business, db
from business_ar_api.services import AccountService
from business_ar_api.services.business_service import BusinessService
from business_ar_api.services.rest_service import RestService

from ar_reminder.config import CONFIGURATION
from ar_reminder.utils.logging import setup_logging

setup_logging(os.path.join(os.path.abspath(
    os.path.dirname(__file__)), "logging.conf"))

CONTENT_TYPE_JSON = {"Content-Type": "application/json"}
TIMEOUT = 20


def create_app(run_mode=os.getenv("FLASK_ENV", "production")):
    """Return a configured Flask App using the Factory method."""
    app = Flask(__name__)
    app.config.from_object(CONFIGURATION[run_mode])
    db.init_app(app)

    register_shellcontext(app)

    return app


def register_shellcontext(app):
    """Register shell context objects."""

    def shell_context():
        """Shell context objects."""
        return {"app": app}

    app.shell_context_processor(shell_context)


def _process_and_send_email(app: Flask, token: str, business: Business, fiscal_year: int, filled_template):
    try:
        recipient = business.email
        nano_id = generate()
        email_template = Template(filled_template, autoescape=True)
        access_url = f"{app.config.get('BAR_APP_URL')}/en-CA?nanoid={nano_id}"
        email_kwargs = {
            "year": fiscal_year,
            "business_legal_name": business.legal_name,
            "token": nano_id,
            "access_url": access_url,
            "ar_start_date": business.founding_date,
            "bc_number": business.identifier,
            "legal_type": business.legal_type,
        }

        html_out = email_template.render(email_kwargs)

        email_dict = {
            "recipients": recipient,
            "content": {
                "subject": "Annual Report Reminder",
                "body": html_out,
                "attachments": []
            }
        }

        if email_dict:
            send_email(app, email_dict, token=token)
            ar_reminder = AnnualReportReminder(
                business_id=business.id,
                recipient=recipient,
                message=html_out,
                token=nano_id,
                fiscal_year=fiscal_year,
                status=AnnualReportReminder.Status.SENT,
                sent_date=datetime.utcnow(),
            )
            ar_reminder.save()

    except Exception as exception:
        app.logger.error(f"Failed to send reminder for business {
                         business.identifier}", exception)
        raise exception


def send_email(app: Flask, notify_body: dict, token: str):
    """Send the email asynchronously, using the given details."""
    app.logger.info(f'send_email to {notify_body.get("recipients")}')
    notify_url = app.config.get("NOTIFY_API_URL") + "/notify/"
    RestService.post(notify_url, token=token, data=notify_body)
    app.logger.info(f'Email sent to {notify_body.get("recipients")}')


def update_ar_indicator_in_colin(app: Flask, legal_type: str, identifier: str, token: str):
    """Calls Colin API in Lear: turns off ar reminder flag and insert into set_ar_to_no"""
    url = f'{app.config["COLIN_API_URL"]
             }/businesses/{legal_type}/{identifier}/filings/reminder'
    headers = {
        **CONTENT_TYPE_JSON,
        "Authorization": AuthHeaderType.BEARER.value.format(token),
    }

    try:
        req = requests.post(url, headers=headers, timeout=TIMEOUT)

        if req.status_code == HTTPStatus.OK:
            app.logger.info(f'Successfully updated AR status for corporation {
                            identifier} in Colin.')
            return True

        app.logger.error(
            f'Failed to update AR status for corporation {identifier}. '
            f'Status Code: {req.status_code}, Response: {req.text}'
        )
        return False

    except Exception as e:
        app.logger.error(f'Error updating AR status for corporation {
                         identifier}: {str(e)}')
        return False


def run():
    """Get corporations from the GCP businesses table and send out AR Reminder emails."""
    application = create_app()
    with application.app_context():
        try:
            client_id = application.config.get("NOTIFY_API_SVC_CLIENT_ID")
            client_secret = application.config.get(
                "NOTIFY_API_SVC_CLIENT_SECRET")
            token = AccountService.get_service_client_token(
                client_id, client_secret)
            filled_template = Path(f"{application.config.get('EMAIL_TEMPLATE_PATH')}/ar_reminder.html").read_text(
                encoding="utf-8"
            )

            businesses = _get_businesses()
            for business in businesses:
                try:
                    application.logger.info(
                        "Business: %s, Last AR Reminder Year: %s",
                        business.identifier,
                        business.last_ar_reminder_year,
                    )
                    # Always get business details
                    business_details = BusinessService.get_business_details_from_colin(
                        business.identifier, business.legal_type, business.id
                    )
                    if business.last_ar_reminder_year:
                        next_ar_reminder_year = business.last_ar_reminder_year + 1
                    else:
                        next_ar_reminder_year = int(
                            business_details.get("business", {}).get("nextARYear", 0))
                    # check if it is an admin freeze first. If it is, then skip the processing
                    adminFreeze = business_details.get(
                        "business").get("adminFreeze")
                    # also need to check if corpState is in 'LIQ' or not. If it is, then skip the processing
                    corpState = business_details.get(
                        "business").get("corpState")
                    application.logger.info(
                        "Admin Freeze is: %s, Corp State is:%s ", adminFreeze, corpState)
                    if adminFreeze != 'True' and corpState != 'LIQ':
                        current_year = datetime.utcnow().year
                        application.logger.info(
                            "Next AR year: %s", next_ar_reminder_year)
                        if next_ar_reminder_year > current_year:
                            business.last_ar_reminder_year = current_year
                            business.save()
                            continue
                        _process_and_send_email(
                            application,
                            token,
                            business,
                            next_ar_reminder_year,
                            filled_template,
                        )
                        business.last_ar_reminder_year = next_ar_reminder_year
                        business.save()
                        update_ar_indicator_in_colin(
                            application, business.legal_type, business.identifier, token)
                except Exception as err:
                    application.logger.error(
                        "Error processing business %s: %s",
                        business.identifier,
                        str(err),
                    )
        except Exception as err:
            application.logger.error("General error occurred: %s", str(err))


def _get_businesses():
    where_clause = text(
        "state='ACT' and ar_reminder_flag is true and "
        "(date_part('doy', founding_date) between date_part('doy', current_Date) and "
        "date_part('doy', current_Date + interval '14 days')) and "
        "(last_ar_reminder_year is NULL or last_ar_reminder_year < extract(year from current_date))"
    )

    businesses = db.session.query(Business).filter(
        where_clause).order_by(Business.founding_date).limit(25).all()

    return businesses
