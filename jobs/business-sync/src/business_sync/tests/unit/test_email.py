import pytest
from unittest.mock import patch, MagicMock
from business_sync.job import run
from business_ar_api.models import Business

@patch("business_sync.job.create_app")
@patch("business_sync.job.start_cloud_sql_proxy")
@patch("business_sync.job.time.sleep")
def test_run(mock_sleep, mock_start_cloud_proxy, mock_create_app):
    """Test that the run() function executes without errors."""
    # Create a mock app and supply minimal config required by run()
    mock_app = MagicMock()
    mock_app.app_context.return_value.__enter__.return_value = None
    mock_app.config = {
        "WAREHOUSE_URI": "sqlite:///:memory:",
        "DEPLOYMENT_ENVIRONMENT": "testing",
        "remove_temp_file": MagicMock()
    }
    mock_create_app.return_value = mock_app

    run()
    
    mock_create_app.assert_called_once()
    mock_start_cloud_proxy.assert_called_once()
    mock_app.app_context.assert_called_once()

@pytest.fixture
def mock_db():
    with patch("business_sync.job.db") as mock:
        yield mock

@pytest.mark.parametrize("business_exists,expected_saves", [
    (False, 1),  # New business – expect save() to be called
    (True, 1)    # Existing business – updated and saved
])
def test_run_with_businesses(mock_db, business_exists, expected_saves):
    """Test business creation scenarios."""
    # Create mocks for the engine and its connection/execute results
    mock_engine = MagicMock()
    mock_connection = MagicMock()
    mock_result = MagicMock()
    mock_result.all.return_value = [
        MagicMock(
            corp_num="BC1234567",
            admin_email="test@example.com",
            corp_nme="Test Corp",
            recognition_dts="2020-01-01",
            corp_typ_cd="BC",
            send_ar_ind="Y",
            bn_15="1234567890",
            corp_state="ACT",
            last_ar_filed_year=2019
        )
    ]
    mock_connection.execute.return_value = mock_result
    mock_engine.connect.return_value.__enter__.return_value = mock_connection

    # Create a fake app with a valid warehouse URI and required configuration
    mock_app = MagicMock()
    mock_app.config = {
        "WAREHOUSE_URI": "sqlite:///:memory:",
        "DEPLOYMENT_ENVIRONMENT": "testing",
        "remove_temp_file": MagicMock()
    }

    with patch("business_sync.job.create_app", return_value=mock_app), \
         patch("business_sync.job.start_cloud_sql_proxy"), \
         patch("business_sync.job.time.sleep"), \
         patch("business_sync.job.sqlalchemy.create_engine", return_value=mock_engine), \
         patch("business_sync.job.Business.find_by_identifier") as mock_find, \
         patch("business_sync.job.Business.save") as mock_save:
        
        mock_find.return_value = Business() if business_exists else None        
        run()
        
        assert mock_connection.execute.called
        assert mock_save.call_count == expected_saves

def test_run_no_businesses_found():
    """Test no businesses case."""
    mock_engine = MagicMock()
    mock_connection = MagicMock()
    mock_result = MagicMock()
    mock_result.all.return_value = []
    mock_connection.execute.return_value = mock_result
    mock_engine.connect.return_value.__enter__.return_value = mock_connection

    # Create a fake app with the required configuration
    mock_app = MagicMock()
    mock_app.config = {
        "WAREHOUSE_URI": "sqlite:///:memory:",
        "DEPLOYMENT_ENVIRONMENT": "testing",
        "remove_temp_file": MagicMock()
    }
    
    with patch("business_sync.job.create_app", return_value=mock_app), \
         patch("business_sync.job.start_cloud_sql_proxy"), \
         patch("business_sync.job.time.sleep"), \
         patch("business_sync.job.sqlalchemy.create_engine", return_value=mock_engine), \
         patch("business_sync.job.Business.save") as mock_save:
        
        # Setup a fake logger to capture info messages
        mock_logger = MagicMock()
        mock_app.logger.info = mock_logger

        run()
        
        mock_logger.assert_called_with("Number of businesses to update: %d", 0)
        mock_save.assert_not_called()

def test_run_database_error_handling():
    """Test error handling when an exception occurs during engine creation."""
    # Create a fake app with the required configuration
    mock_app = MagicMock()
    mock_app.config = {
        "WAREHOUSE_URI": "sqlite:///:memory:",
        "DEPLOYMENT_ENVIRONMENT": "testing",
        "remove_temp_file": MagicMock()
    }

    with patch("business_sync.job.create_app", return_value=mock_app), \
         patch("business_sync.job.start_cloud_sql_proxy"), \
         patch("business_sync.job.time.sleep"), \
         patch("business_sync.job.sqlalchemy.create_engine", side_effect=Exception("DB error")):
         
        mock_logger = MagicMock()
        mock_app.logger.error = mock_logger

        run()
        # Instead of raising, run() should catch the exception and log it
        mock_logger.assert_called_once()
        logged_arg = mock_logger.call_args[0][0]
        assert "DB error" in str(logged_arg)