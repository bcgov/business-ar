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
"""Job to sync business info from colin warehouse to business ar db.
"""
import os

import sqlalchemy
from business_ar_api.models import Business, db
from business_sync.config import CONFIGURATION
from business_sync.utils.logging import setup_logging
from flask import Flask
from sqlalchemy.sql.expression import text

setup_logging(os.path.join(os.path.abspath(os.path.dirname(__file__)), "logging.conf"))


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


def run():
    """Get the businesses from warehouse that has anniversary in next 2 days and sync the info
    with the Business AR db."""
    application = create_app()
    with application.app_context():
        try:
            warehouse_uri = application.config.get("WAREHOUSE_URI")
            engine = sqlalchemy.create_engine(warehouse_uri)
            with engine.connect() as connection:
                # TODO: Add filter for BC company legal types
                result_set = connection.execute(
                    text(
                        "select c.*, s.state_typ_cd as corp_state, cn.corp_nme as corp_name from colin.corporation c join colin.CORP_STATE s on s.corp_num = c.corp_num and s.end_event_id is null join colin.corp_name cn on cn.end_event_id is null and cn.corp_num=c.corp_num where c.send_ar_ind = 'Y' and c.admin_email is not null and c.recognition_dts is NOT NULL and (date_part('doy', c.recognition_dts) between date_part('doy', current_date) and "
                        + "date_part('doy', current_date + interval '2 days')) order by c.recognition_dts limit 5"
                    )
                )
                results = result_set.all()
                application.logger.info(
                    "Number of businesses to update: {}".format(len(results))
                )
                for row in results:
                    try:
                        identifier = row.corp_num
                        if row.corp_typ_cd == "BC" and not row.corp_num.startswith(
                            "BC"
                        ):
                            identifier = f"BC{row.corp_num}"
                        business = Business.find_by_identifier(identifier)
                        if not business:
                            business = Business(
                                identifier=identifier,
                                legal_type=row.corp_typ_cd,
                                founding_date=row.recognition_dts,
                            )
                        business.legal_name = row.corp_name
                        business.email = row.admin_email
                        business.ar_reminder_flag = (
                            False if row.send_ar_ind == "N" else True
                        )
                        business.tax_id = row.bn_15
                        # TODO: Update the state of the corp
                        business.save()
                    except Exception as exc:
                        application.logger.error(exc)
        except Exception as err:
            application.logger.error(err)
