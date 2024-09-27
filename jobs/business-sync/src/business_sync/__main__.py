"""
Main entry point for the business-sync job execution.

This script imports the run function from the job module and executes
it when the script is run directly.
"""
from .job import run

if __name__ == "__main__":
    run()
