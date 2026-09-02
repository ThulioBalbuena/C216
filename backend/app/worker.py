import json
import os
import time
from urllib.error import URLError
from urllib.request import urlopen

API_URL = os.getenv("API_URL", "http://backend:8000")


def run() -> None:
    """Consulta periodicamente a API pela rede interna do Compose."""
    while True:
        try:
            with urlopen(f"{API_URL}/health", timeout=5) as response:
                payload = json.load(response)
                print(f"API respondeu: {payload}", flush=True)
        except (URLError, TimeoutError) as error:
            print(f"Falha ao consultar a API: {error}", flush=True)

        time.sleep(10)


if __name__ == "__main__":
    run()
