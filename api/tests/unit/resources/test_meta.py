from tests import no_firebase_github_ci

from ..services.auth.conftest import firebase_token

def test_open_meta(client):
    """Test the open meta endpoint."""

    rv = client.get('/v1/meta')

    assert rv.status_code == 200

@no_firebase_github_ci
def test_protected_meta(client, firebase_token):
    """Test the protected meta endpoint.
    
    This requires a valid JWT"""


    # Success
    rv = client.get('/v1/meta/protected',
                    headers={'Authorization': f'Bearer {firebase_token}'})

    assert rv.status_code == 200

    # Should FAIL
    rv = client.get('/v1/meta/protected',
                    headers={'Authorization': f'Bearer Bogus Token'})

    assert rv.status_code == 403
