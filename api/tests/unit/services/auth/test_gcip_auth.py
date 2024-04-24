from firebase_admin import auth as firebase_auth
from flask import request

from business_ar_api.services.auth.gcip_auth import GoogleAuth

from tests import no_firebase_github_ci


PERMISSIONS = [
    {"account_id": "1",
     "products": [{"product": "bar", "roles": "view,submit,pay"}]},
    {"account_id": "*",
     "products": [{"product": "pay", "roles": "view"}]},
    ]

@no_firebase_github_ci
def test_access(firebase_token):
    """Test the fixture."""

    try:
        decoded_token = firebase_auth.verify_id_token(firebase_token)
    except Exception as err:
        print(err)

    print(decoded_token)
    assert decoded_token['permissions'] == PERMISSIONS


@no_firebase_github_ci
def test_auth_verify(firebase_token, app):
    with app.test_request_context(headers={"Authorization": "Bearer {}".format(firebase_token)}):
        g_auth = GoogleAuth()
        try:
            decoded_payload =  g_auth._verify_token(request)
        except Exception as err:
            print(err)

        assert decoded_payload
        assert decoded_payload['permissions'] == PERMISSIONS

