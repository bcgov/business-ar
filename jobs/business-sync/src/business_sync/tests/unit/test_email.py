import pytest
from unittest.mock import patch
from business_sync.job import run

@patch("business_sync.job.create_app")
@patch("business_sync.job.start_cloud_sql_proxy")
@patch("business_sync.job.time.sleep", return_value=None)  # Mock out sleep to avoid waiting
def test_run(mock_sleep, mock_start_cloud_sql_proxy, mock_create_app):
    """Test that the run() function executes without errors."""
    
    # Run the function
    run()

    # Check if the app and proxy were started
    mock_create_app.assert_called_once()
    mock_start_cloud_sql_proxy.assert_called_once()
