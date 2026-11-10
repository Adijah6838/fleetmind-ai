import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent.parent / "fleetmind.db"
SCHEMA_FILE = Path(__file__).resolve().parent / "schema.sql"

def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, isolation_level=None)
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.execute("PRAGMA journal_mode = WAL;")
    return conn

def initialize_database() -> None:
    schema_sql = SCHEMA_FILE.read_text(encoding="utf-8")
    with connect() as conn:
        conn.executescript(schema_sql)
