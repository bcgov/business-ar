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
import subprocess
import time

import sqlalchemy
from business_ar_api.models import Business, db
from flask import Flask
from sqlalchemy.sql.expression import text

from business_sync.config import CONFIGURATION
from business_sync.utils.logging import setup_logging

setup_logging("logging.conf")


def create_app(run_mode=os.getenv("FLASK_ENV", "production")):
    """Return a configured Flask App using the Factory method."""
    app = Flask(__name__)
    app.config.from_object(CONFIGURATION[run_mode])
    db.init_app(app)
    register_shellcontext(app)

    return app


def start_cloud_sql_proxy(app):
    """Start a cloud sql proxy using TCP port."""
    cmd = [
        "cloud-sql-proxy",
        f"--credentials-file={app.config['WAREHOUSE_CREDENTIALS_FILE']}",
        "--address=0.0.0.0",
        f"--port={app.config['WAREHOUSE_DB_PORT']}",
        app.config["AUTH_PROXY_CONNECT"],
    ]
    process = subprocess.Popen(cmd)  # pylint: disable=consider-using-with
    return process


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
    start_cloud_sql_proxy(application)
    time.sleep(5)
    with application.app_context():
        try:
            warehouse_uri = application.config.get("WAREHOUSE_URI")
            env = application.config.get("DEPLOYMENT_ENVIRONMENT")
            engine = sqlalchemy.create_engine(warehouse_uri)
            with engine.connect() as connection:
                result_set = connection.execute(
                    text(
                        """
                        WITH email_counts AS (
                        SELECT admin_email,
                                COUNT(*) AS cnt
                        FROM "colin".corporation
                        GROUP BY admin_email
                        )
                        SELECT
                            co.corp_num,
                            co.recognition_dts,
                            EXTRACT(YEAR FROM co.last_ar_filed_dt) AS last_ar_filed_year,
                            co.corp_typ_cd,
                            co.admin_email,
                            cn.CORP_NME,
                            co.send_ar_ind,
                            co.bn_15,
                            cs.state_typ_cd AS corp_state,
                            ct.corp_class
                        FROM "colin".corporation co
                        JOIN email_counts ec
                        ON co.admin_email = ec.admin_email
                        JOIN "colin".corp_type ct
                        ON co.corp_typ_cd = ct.corp_typ_cd
                        JOIN "colin".corp_state cs
                        ON co.corp_num = cs.corp_num
                        JOIN "colin".corp_name cn
                        ON co.corp_num = cn.corp_num
                        WHERE ec.cnt <= 50
                        AND cs.end_event_id IS NULL
                        AND cn.end_event_id IS NULL
                        AND cn.corp_name_typ_cd = 'CO'
                        AND cs.state_typ_cd = 'ACT'
                        AND ct.corp_class = 'BC'
                        AND co.corp_typ_cd <> 'BEN'
                        AND co.admin_email IS NOT NULL
                        AND co.send_ar_ind = 'Y'
                        AND NOT EXISTS (
                                SELECT 'x'
                                FROM "colin".filing f, "colin".event e, "colin".filing_user u
                                WHERE
                                    f.event_id = e.event_id
                                    AND f.event_id = u.event_id
                                    AND e.corp_num = co.corp_num
                                    AND u.role_typ_cd = 'bcol'
                            )
                        AND NOT EXISTS (
                                SELECT 'x'
                                FROM "auth"."users" u
                                WHERE co.admin_email = u.email
                            )
                        AND NOT EXISTS (
                                SELECT 'x'
                                FROM "auth"."entities" auth
                                WHERE TRIM(LEADING 'BC' FROM auth.business_identifier) = co.corp_num
                            )
                        AND (
                                (co.recognition_dts
                                + ((EXTRACT(YEAR FROM current_date) - EXTRACT(YEAR FROM co.recognition_dts)) * interval '1 year')
                                + interval '1 day')::date = current_date
                            )
                        AND (
                                (
                                    EXTRACT(YEAR FROM co.recognition_dts) = EXTRACT(YEAR FROM current_date) - 1
                                    AND co.last_ar_filed_dt IS NULL
                                )
                                OR (
                                    co.last_ar_filed_dt IS NOT NULL
                                    AND EXTRACT(YEAR FROM co.last_ar_filed_dt) < EXTRACT(YEAR FROM current_date)
                                );
                        """
                    )
                )
                results = result_set.all()
                application.logger.info("Number of businesses to update: %d", len(results))
                for row in results:
                    try:
                        identifier = row.corp_num
                        # if row.corp_typ_cd == "BC" and not row.corp_num.startswith("BC"):
                        #     identifier = f"BC{row.corp_num}"
                        business = Business.find_by_identifier(identifier)
                        if not business:
                            business = Business(
                                identifier=identifier,
                                legal_type=row.corp_typ_cd,
                                founding_date=row.recognition_dts,
                            )
                        business.legal_name = row.corp_nme
                        business.email = row.admin_email if env == "production" else "test@email.com"
                        business.ar_reminder_flag = row.send_ar_ind != "N"
                        business.state = row.corp_state
                        # business.op_state = row.op_state
                        business.tax_id = row.bn_15
                        business.corp_class = row.corp_class
                        business.last_ar_reminder_year = row.last_ar_filed_year
                        business.save()
                    except Exception as exc:
                        application.logger.error(exc)
        except Exception as err:
            application.logger.error(err)
