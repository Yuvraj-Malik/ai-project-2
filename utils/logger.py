import logging
import os

def get_logger(name="app"):
    if not os.path.exists("logs"):
        os.makedirs("logs")

    logger = logging.getLogger(name)

    if not logger.handlers:
        logger.setLevel(logging.INFO)

        formatter = logging.Formatter(
            "%(asctime)s - %(levelname)s - %(message)s"
        )

        file_handler = logging.FileHandler("logs/app.log")
        file_handler.setFormatter(formatter)

        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)

        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

    return logger