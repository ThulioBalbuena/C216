import os

from sqlalchemy import create_engine
from sqlalchemy.engine import URL

database_url = os.getenv("DATABASE_URL") or URL.create(
    "postgresql+psycopg",
    username=os.getenv("POSTGRES_USER", "bilheteria"),
    password=os.getenv("POSTGRES_PASSWORD", "bilheteria_demo"),
    host=os.getenv("POSTGRES_HOST", "localhost"),
    database=os.getenv("POSTGRES_DB", "bilheteria"),
)


engine = create_engine(database_url, pool_pre_ping=True, connect_args={"connect_timeout": 2})
