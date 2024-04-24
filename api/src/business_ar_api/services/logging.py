from __future__ import annotations

import structlog


# adapted from https://github.com/ymotongpoo/cloud-logging-configurations/blob/master/python/structlog/main.py
def field_name_modifier(
    logger: structlog._loggers.PrintLogger, log_method: str, event_dict: dict
) -> dict:
    """A structlog processor for mapping fields to Cloud Logging.
    Learn more at https://www.structlog.org/en/stable/processors.html

    Args:
        logger: A logger object.
        log_method: The name of the wrapped method.
        event_dict:Current context together with the current event.

    Returns:
        A structlog processor.
    """
    # Changes the keys for some of the fields, to match Cloud Logging's expectations
    event_dict["severity"] = event_dict["level"]
    del event_dict["level"]
    event_dict["message"] = event_dict["event"]
    del event_dict["event"]
    return event_dict


def getJSONLogger() -> structlog._config.BoundLoggerLazyProxy:
    """Initialize a logger configured for JSON structured logs.

    Returns:
        A configured logger object.
    """
    # extend using https://www.structlog.org/en/stable/processors.html
    structlog.configure(
        processors=[
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            field_name_modifier,
            structlog.processors.TimeStamper("iso"),
            structlog.processors.JSONRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
    )
    return structlog.get_logger()


logger = getJSONLogger()


def logging_flush() -> None:
    # Setting PYTHONUNBUFFERED in Dockerfile ensured no buffering
    pass
