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
"""Centralized setup of logging for the service."""
import logging
import logging.config
import os
import sys
import google.cloud.logging
from google.cloud.logging.handlers import CloudLoggingHandler


def initialize_logging(conf):
    """Create the services logger."""
    if conf and os.path.isfile(conf):
        logging.config.fileConfig(conf)
        print("Configure logging, from conf: {}".format(conf), file=sys.stdout)
    else:
        # Fallback to Google Cloud Logging
        print(
            "Unable to configure logging, attempted conf: {}. Falling back to Google Cloud Logging.".format(conf),
            file=sys.stderr,
        )

        # Initialize Google Cloud Logging client
        client = google.cloud.logging.Client()

        # Set up a handler for Google Cloud Logging
        handler = CloudLoggingHandler(client)

        # Add the handler to the root logger
        root_logger = logging.getLogger()
        root_logger.addHandler(handler)

        # Set the logging level
        root_logger.setLevel(logging.DEBUG)

        logging.info("Logging is now set up in Google Cloud!")
