import logging


def setup_logger() -> logging.Logger:
    """
    Configura y devuelve el logger principal de la aplicación.
    """

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    )

    return logging.getLogger("knowledgehub")


logger = setup_logger()