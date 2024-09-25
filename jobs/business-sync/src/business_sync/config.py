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
import tempfile
import atexit

from dotenv import find_dotenv, load_dotenv

load_dotenv(find_dotenv())

CONFIGURATION = {
    "development": "business_sync.config.DevConfig",
    "testing": "business_sync.config.TestConfig",
    "production": "business_sync.config.ProdConfig",
    "default": "business_sync.config.ProdConfig",
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


class _Config:  # pylint: disable=too-few-public-methods
    """Base class configuration."""

    PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))

    SENTRY_DSN = os.getenv("SENTRY_DSN", "")

    DEPLOYMENT_ENVIRONMENT = os.getenv("DEPLOYMENT_ENVIRONMENT", "development")

    DB_USER = os.getenv("DATABASE_USERNAME", "")
    DB_PASSWORD = os.getenv("DATABASE_PASSWORD", "")
    DB_NAME = os.getenv("DATABASE_NAME", "")
    DB_HOST = os.getenv("DATABASE_HOST", "")
    DB_PORT = int(os.getenv("DATABASE_PORT", "5432"))  # POSTGRESQL
    # POSTGRESQL
    if DB_UNIX_SOCKET := os.getenv("DATABASE_UNIX_SOCKET", None):
        SQLALCHEMY_DATABASE_URI = (
            f"postgresql+pg8000://{DB_USER}:{DB_PASSWORD}@/{DB_NAME}"
            f"?unix_sock={DB_UNIX_SOCKET}/.s.PGSQL.5432"
        )
    else:
        SQLALCHEMY_DATABASE_URI = (
            f"postgresql+pg8000://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

    WAREHOUSE_DB_UNIX_SOCKET = os.getenv("WAREHOUSE_DB_UNIX_SOCKET")
    # WAREHOUSE_CREDENTIALS_FILE = os.getenv("WAREHOUSE_CREDENTIALS_FILE")
    AUTH_PROXY_CONNECT = os.getenv("AUTH_PROXY_CONNECT")
    WAREHOUSE_DB_USER = os.getenv("WAREHOUSE_DB_USER", "")
    WAREHOUSE_DB_PASSWORD = os.getenv("WAREHOUSE_DB_PASSWORD", "")
    WAREHOUSE_DB_HOST = os.getenv("WAREHOUSE_DB_HOST", "localhost")
    WAREHOUSE_DB_PORT = os.getenv("WAREHOUSE_DB_PORT", "6003")
    WAREHOUSE_DB_NAME = os.getenv("WAREHOUSE_DB_NAME", "fin_warehouse")
    WAREHOUSE_CREDENTIALS_FILE_PATH = None

    # Get the contents of the credentials from the environment variable
    WAREHOUSE_CREDENTIALS_FILE_CONTENTS = os.getenv("WAREHOUSE_CREDENTIALS_FILE", None)

    if WAREHOUSE_CREDENTIALS_FILE_CONTENTS:
        # Optionally strip leading/trailing quotes if necessary
        if WAREHOUSE_CREDENTIALS_FILE_CONTENTS.startswith("'") and WAREHOUSE_CREDENTIALS_FILE_CONTENTS.endswith("'"):
            WAREHOUSE_CREDENTIALS_FILE_CONTENTS = WAREHOUSE_CREDENTIALS_FILE_CONTENTS[1:-1]

        # Write the credentials contents to a temporary file
        with tempfile.NamedTemporaryFile(mode='w', delete=False) as temp_cred_file:
            temp_cred_file.write(WAREHOUSE_CREDENTIALS_FILE_CONTENTS)
            WAREHOUSE_CREDENTIALS_FILE_PATH = temp_cred_file.name  # Assign directly without '_Config'

        # Register cleanup function to delete the temp file at exit
        @staticmethod
        def remove_temp_file():
            """Remove temp file generated"""
            try:
                if _Config.WAREHOUSE_CREDENTIALS_FILE_PATH:
                    os.remove(_Config.WAREHOUSE_CREDENTIALS_FILE_PATH)
            except OSError:
                pass

        atexit.register(remove_temp_file)

    # Update the config to use the temporary file path
    WAREHOUSE_CREDENTIALS_FILE = WAREHOUSE_CREDENTIALS_FILE_PATH
    WAREHOUSE_URI = (
        f"postgresql+psycopg2://{WAREHOUSE_DB_USER}:{WAREHOUSE_DB_PASSWORD}@/"
        f"{WAREHOUSE_DB_NAME}?host=/cloudsql/{AUTH_PROXY_CONNECT}"
    )

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

    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{DATABASE_TEST_USERNAME}:{DATABASE_TEST_PASSWORD}@"
        f"{DATABASE_TEST_HOST}:{DATABASE_TEST_PORT}/{DATABASE_TEST_NAME}"
    )


class ProdConfig(_Config):  # pylint: disable=too-few-public-methods
    """Production environment configuration."""

    SECRET_KEY = os.getenv("SECRET_KEY", None)

    if not SECRET_KEY:
        SECRET_KEY = os.urandom(24)
        print("WARNING: SECRET_KEY being set as a one-shot", file=sys.stderr)

    TESTING = False
    DEBUG = False
