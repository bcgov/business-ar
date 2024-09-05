import unittest
from unittest.mock import patch
from flask import Flask
from ar_reminder.job import _process_and_send_email
from business_ar_api.models import Business, AnnualReportReminder

class TestARReminderJob(unittest.TestCase):
    @patch('business_ar_api.models.AnnualReportReminder.save')  # Mock the save method to avoid database interaction
    @patch('business_ar_api.services.rest_service.RestService.post')  # Mock the RestService post method
    def test_process_and_send_email(self, mock_post, mock_save):
        # Set up a basic Flask app for the test
        app = Flask(__name__)
        app.config['BAR_APP_URL'] = "http://mock-url"
        app.config['NOTIFY_API_URL'] = "http://mock-notify-api-url"  # Mock the NOTIFY_API_URL
        
        # Mock business object
        business = Business(
            id=1,
            email="test@example.com",
            legal_name="Test Business",
            founding_date="2020-01-01",
            identifier="BC1234567"
        )
        
        # Mock fiscal year and template
        fiscal_year = 2023
        filled_template = "Test template content"
        
        # Mock the post method to return a successful response
        mock_post.return_value = None  # Simulating a successful request with no return value
        mock_save.return_value = None  # Simulating the save method for AnnualReportReminder

        # Call the function to see if it runs without errors
        with app.app_context():
            try:
                _process_and_send_email(app, "mock_token", business, fiscal_year, filled_template)
            except Exception as e:
                self.fail(f"_process_and_send_email raised an exception: {e}")

        # Ensure the post request was called once
        mock_post.assert_called_once()
        # Ensure the save method was called once
        mock_save.assert_called_once()

if __name__ == "__main__":
    unittest.main()
