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
"""API endpoints for managing accounts."""

from flask import Blueprint, request
from flask_cors import cross_origin

from http import HTTPStatus
from business_ar_api.common.auth import jwt as _jwt

bp = Blueprint("KEYS", __name__, url_prefix=f"/v1/accounts")


@bp.route("", methods=["GET", "OPTIONS"])
@cross_origin(origins="*", methods=["GET", "POST"])
# @_jwt.has_one_of_roles(
#     [Role.SYSTEM.value, Role.STAFF_MANAGE_ACCOUNTS.value, Role.ACCOUNT_HOLDER.value]
#)
def get_accounts():
    """Get all API keys for the account."""
    return {}, HTTPStatus.OK
