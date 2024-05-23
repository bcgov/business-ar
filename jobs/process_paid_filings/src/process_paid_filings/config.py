# Copyright © 2019 Province of British Columbia
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
"""All of the configuration for the service is captured here."""

import os
import sys

from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())

CONFIGURATION = {
    "development": "process_paid_filings.config.DevConfig",
    "testing": "process_paid_filings.config.TestConfig",
    "production": "process_paid_filings.config.ProdConfig",
    "default": "process_paid_filings.config.ProdConfig",
}


def get_named_config(config_name: str = "production"):
    """Return the configuration object based on the name."""
    if config_name in ["production", "staging", "default"]:
        config = ProdConfig()
    elif config_name == "testing":
        config = TestConfig()
    elif config_name == "development":
        config = DevConfig()
    else:
        raise KeyError(f"Unknown configuration '{config_name}'")
    return config


class _Config(object):  # pylint: disable=too-few-public-methods
    """Base class configuration."""

    PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))

    SENTRY_DSN = os.getenv("SENTRY_DSN", "")

    AUTH_SVC_URL = os.getenv("AUTH_SVC_URL")

    BUSINESS_AR_API_URL = os.getenv("BUSINESS_AR_API_URL", "") + os.getenv(
        "BUSINESS_AR_API_VERSION", ""
    )

    COLIN_API_URL = os.getenv("COLIN_API_URL", "") + os.getenv("COLIN_API_VERSION", "")
    COLIN_API_SVC_CLIENT_ID = os.getenv("COLIN_API_SVC_CLIENT_ID")
    COLIN_API_SVC_CLIENT_SECRET = os.getenv("COLIN_API_SVC_CLIENT_SECRET")

    TESTING = False
    DEBUG = False


class DevConfig(_Config):  # pylint: disable=too-few-public-methods
    """Development environment configuration."""

    TESTING = False
    DEBUG = True


class TestConfig(_Config):  # pylint: disable=too-few-public-methods
    """In support of testing only used by the py.test suite."""

    DEBUG = True
    TESTING = True

    DATABASE_TEST_USERNAME = os.getenv("DATABASE_TEST_USERNAME", "")
    DATABASE_TEST_PASSWORD = os.getenv("DATABASE_TEST_PASSWORD", "")
    DATABASE_TEST_NAME = os.getenv("DATABASE_TEST_NAME", "")
    DATABASE_TEST_HOST = os.getenv("DATABASE_TEST_HOST", "")
    DATABASE_TEST_PORT = int(os.getenv("DATABASE_TEST_PORT", "5432"))  # POSTGRESQL

    SQLALCHEMY_DATABASE_URI = f"postgresql://{DATABASE_TEST_USERNAME}:{DATABASE_TEST_PASSWORD}@{DATABASE_TEST_HOST}:{DATABASE_TEST_PORT}/{DATABASE_TEST_NAME}"

    COLIN_URL = os.getenv("COLIN_URL_TEST", "")
    LEGAL_URL = os.getenv("LEGAL_URL_TEST", "")


class ProdConfig(_Config):  # pylint: disable=too-few-public-methods
    """Production environment configuration."""

    SECRET_KEY = os.getenv("SECRET_KEY", None)

    if not SECRET_KEY:
        SECRET_KEY = os.urandom(24)
        print("WARNING: SECRET_KEY being set as a one-shot", file=sys.stderr)

    TESTING = False
    DEBUG = False
