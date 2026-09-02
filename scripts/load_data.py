"""
Load the sample CSVs in data/ into the Postgres database pointed to by
DATABASE_URL (read from backend/.env).

Usage:
    python scripts/load_data.py
"""

import csv
import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"

load_dotenv(ROOT / "backend" / ".env")
DATABASE_URL = os.environ["DATABASE_URL"]

DDL = """
CREATE TABLE IF NOT EXISTS students (
    sid TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone_number TEXT
);

CREATE TABLE IF NOT EXISTS branch (
    sid TEXT REFERENCES students(sid),
    branch TEXT
);

CREATE TABLE IF NOT EXISTS results (
    sid TEXT REFERENCES students(sid),
    marks INTEGER
);
"""

# table name -> (csv file, insert sql)
TABLES = {
    "students": (
        "students.csv",
        """
        INSERT INTO students (sid, name, email, phone_number)
        VALUES (%(sid)s, %(name)s, %(email)s, %(phone_number)s)
        ON CONFLICT (sid) DO UPDATE SET
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            phone_number = EXCLUDED.phone_number
        """,
    ),
    "branch": (
        "branch.csv",
        "INSERT INTO branch (sid, branch) VALUES (%(sid)s, %(branch)s)",
    ),
    "results": (
        "results.csv",
        "INSERT INTO results (sid, marks) VALUES (%(sid)s, %(marks)s)",
    ),
}


def load_csv(path: Path) -> list[dict]:
    with open(path, newline="") as f:
        return list(csv.DictReader(f))


def main() -> None:
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute(DDL)

            # branch/results have no unique key to upsert on, so clear them
            # before reloading to keep the script idempotent.
            cur.execute("TRUNCATE branch, results")

            for table, (filename, insert_sql) in TABLES.items():
                rows = load_csv(DATA_DIR / filename)
                cur.executemany(insert_sql, rows)
                print(f"Loaded {len(rows)} rows into {table}")

        conn.commit()
    finally:
        conn.close()

    print("Done.")


if __name__ == "__main__":
    main()
