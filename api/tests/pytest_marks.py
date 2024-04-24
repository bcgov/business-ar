import os

import pytest
from dotenv import find_dotenv, load_dotenv


# this will load all the envars from a .env file located in the project root (api)
load_dotenv(find_dotenv())


no_firebase_github_ci = pytest.mark.skipif((os.getenv('NO_FIREBASE_GITHUB_CI', False) is False),
                                   reason='Does not pass on github ci.')