import logging
import sys


def setup_logger() -> logging.Logger:
    """
    Configura el logger principal de la aplicación.
    """

    logger = logging.getLogger("knowledgehub")

    if logger.hasHandlers():
        return logger

    logger.setLevel(logging.INFO)

    formatter = logging.Formatter(
        "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
    )

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    logger.addHandler(console_handler)

    return logger


logger = setup_logger()