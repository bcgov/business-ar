import os
from tests import no_firebase_github_ci

from business_ar_api.services.auth import SBCAuthManager

@no_firebase_github_ci
def test_decorator_success(firebase_token):
    from flask import Flask
    FIREBASE_AUTH_EMULATOR_HOST = os.getenv("FIREBASE_AUTH_EMULATOR_HOST", "")
    PROJECT_ID = os.getenv("PROJECT_ID", "")
    app = Flask(__name__)
    app.config['FIREBASE_AUTH_EMULATOR_HOST'] = FIREBASE_AUTH_EMULATOR_HOST
    app.config['PROJECT_ID'] = PROJECT_ID
    sam = SBCAuthManager(app)
    route = '/decorator_test'
    msg = 'this is protected content'

    @app.route(route)
    @sam.jwt_authenticated
    def jwt_authenticated_test():
        return msg
    
    with app.test_client() as client: 
         rv = client.get(route,
                    headers={'Authorization': f'Bearer {firebase_token}'})

    assert rv.status_code == 200
    assert rv.data == msg.encode()


@no_firebase_github_ci
def test_decorator_failure(firebase_token):
    from flask import Flask
    FIREBASE_AUTH_EMULATOR_HOST = os.getenv("FIREBASE_AUTH_EMULATOR_HOST", "")
    PROJECT_ID = os.getenv("PROJECT_ID", "")
    app = Flask(__name__)
    app.config['FIREBASE_AUTH_EMULATOR_HOST'] = FIREBASE_AUTH_EMULATOR_HOST
    app.config['PROJECT_ID'] = PROJECT_ID
    sam = SBCAuthManager(app)

    route = '/decorator_test'
    msg = 'this is protected content'

    @app.route(route)
    @sam.jwt_authenticated
    def jwt_authenticated_test():
        return msg
    with app.test_client() as client: 
        rv = client.get(route,
                    headers={'Authorization': f'Bearer No-Token'})

    assert rv.status_code == 403
    assert rv.data.startswith(b'Error with authentication')

