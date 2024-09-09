import unittest
from process_paid_filings.job import clean_none

class TestJob(unittest.TestCase):
    def test_clean_none(self):
        # Input dictionary with None values
        input_dict = {
            'key1': 'value1',
            'key2': None,
            'key3': {
                'subkey1': None,
                'subkey2': 'value2'
            }
        }

        # Expected output where None values are replaced with empty strings
        expected_dict = {
            'key1': 'value1',
            'key2': '',
            'key3': {
                'subkey1': '',
                'subkey2': 'value2'
            }
        }

        # Call the clean_none function
        clean_none(input_dict)

        # Assert that the input dict has been modified as expected
        self.assertEqual(input_dict, expected_dict)

if __name__ == '__main__':
    unittest.main()
