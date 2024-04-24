import copy
import os
import pytest
import requests

import firebase_admin
from firebase_admin import auth

os.environ["FIREBASE_AUTH_EMULATOR_HOST"] = "127.0.0.1:9099"

OPT = {'projectId':'firebase-demo'}
try:
    DEFAULT_APP = firebase_admin.get_app()
except ValueError as err:
    DEFAULT_APP = firebase_admin.initialize_app(options=OPT)

EMULATOR_HOST = 'http://localhost:9099'

EMAIL = 'user@example.com'
PASSWORD = 'abc123'

SAMPLE_USER = {
        "displayName": "Example",
        "email": EMAIL,
        "password": PASSWORD,
        "phoneNumber": "+012504188888", 
    }

PERMISSIONS = [
    {"account_id": "1",
     "products": [{"product": "bar", "roles": "view,submit,pay"}]},
    {"account_id": "*",
     "products": [{"product": "pay", "roles": "view"}]},
    ]


@pytest.fixture(scope="session")
def firebase_token():
    """Fixture that returns an id_token from the Firebase Emulator."""
    user = auth.create_user(email=EMAIL, password=PASSWORD )
    uid = user.uid
    permissions_claims = {
        'permissions': PERMISSIONS
    }

    auth.set_custom_user_claims(uid, permissions_claims)

    id_token = create_token()

    # Fixture supplies an id_token
    yield id_token

    delete_user(id_token)

    print('done')


def test_access(firebase_token):
    """Test the fixture."""

    try:
        decoded_token = auth.verify_id_token(firebase_token)
    except Exception as err:
        print(err)

    print(decoded_token)
    assert decoded_token['permissions'] == PERMISSIONS


def create_token(email: str = EMAIL, password: str = PASSWORD):
    """Create a JWT token for the provided or default user."""
    signin_url = f'{EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword'
    signin_data = {
        "email": email,
        "password": password,
    }
    r = requests.post(signin_url, json=signin_data, headers={'Authorization': 'Bearer owner'})
    token = r.json().get('idToken')
    return token
    
def create_user(user: dict):
    """Create a user from the supplied dict."""
    signup_url = f'{EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp'
    r = requests.post(signup_url, json=user, headers={'Authorization': 'Bearer owner'})
    user = r.json()
    print(user)
    return user
    
def delete_all(project: str = 'firebase-demo'):
    """Delete all users."""
    delete_users_url = f'{EMULATOR_HOST}/emulator/v1/projects/{project}/accounts'
    r = requests.delete(delete_users_url, headers={'Authorization': 'Bearer owner'})
    print(r)

def delete_user(token, project: str = 'firebase-demo'):
    """Delete the user for the supplied token."""
    delete_users_url = f'{EMULATOR_HOST}/emulator/v1/projects/{project}/accounts'
    r = requests.delete(delete_users_url,
                        headers={'Authorization': 'Bearer owner'},
                        json={"idToken": token})
    print(r)
