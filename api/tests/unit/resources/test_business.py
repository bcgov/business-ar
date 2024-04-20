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
"""Tests for the business resource.

Test suite to ensure that the Business endpoints are working as expected.
"""
from http import HTTPStatus

from business_ar_api.models import Business


def test_business_look_up_by_nano_id(session, client):
    """Assert that a Business can be looked up using the nano id."""
    business = Business(
        legal_name="Test Business 1",
        legal_type="BC",
        identifier="BC1217715",
        tax_id="BN1234567899876",
        nano_id="V1StGXR8_Z5jdHi6B-12T",
    )
    business.save()
    assert business.id is not None

    rv = client.get(f"/v1/business/token/{business.nano_id}")

    assert rv.status_code == HTTPStatus.OK
    assert rv.json == {
        "legalName": business.legal_name,
        "legalType": business.legal_type,
        "identifier": business.identifier,
        "taxId": business.tax_id,
    }


def test_business_does_not_exist(session, client):
    """Assert that error is returned."""
    business = Business(
        legal_name="Test Business 4",
        legal_type="BC",
        identifier="BC1215715",
        tax_id="BN1234567899876",
        nano_id="V1StGXR8_Z5jdBj7B-12T",
    )
    business.save()
    assert business.id is not None

    rv = client.get(f"/v1/business/token/123")

    assert rv.status_code == HTTPStatus.NOT_FOUND
