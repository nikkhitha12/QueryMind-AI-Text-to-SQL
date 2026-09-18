"""
Load Travel & Tourism CSV data into PostgreSQL.

CSV files expected inside:
backend/data/

Tables created:
    destinations
    hotels
    customers
    bookings
    reviews
    activities
"""

import csv
import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv


# --------------------------------------------------
# PATHS
# --------------------------------------------------

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"

load_dotenv(ROOT / ".env")

DATABASE_URL = os.environ["DATABASE_URL"]


# --------------------------------------------------
# DATABASE TABLES
# --------------------------------------------------

DDL = """
CREATE TABLE IF NOT EXISTS destinations (
    destination_id TEXT PRIMARY KEY,
    destination_name TEXT NOT NULL,
    state TEXT,
    country TEXT,
    category TEXT
);

CREATE TABLE IF NOT EXISTS hotels (
    hotel_id TEXT PRIMARY KEY,
    hotel_name TEXT NOT NULL,
    destination_id TEXT REFERENCES destinations(destination_id),
    price_per_night NUMERIC(10,2),
    rating NUMERIC(2,1)
);

CREATE TABLE IF NOT EXISTS customers (
    customer_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT,
    state TEXT
);

CREATE TABLE IF NOT EXISTS bookings (
    booking_id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(customer_id),
    hotel_id TEXT REFERENCES hotels(hotel_id),
    check_in DATE,
    check_out DATE,
    guests INTEGER,
    status TEXT
);

CREATE TABLE IF NOT EXISTS reviews (
    review_id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(customer_id),
    hotel_id TEXT REFERENCES hotels(hotel_id),
    rating INTEGER,
    review_date DATE
);

CREATE TABLE IF NOT EXISTS activities (
    activity_id TEXT PRIMARY KEY,
    destination_id TEXT REFERENCES destinations(destination_id),
    activity_name TEXT NOT NULL,
    activity_type TEXT,
    price NUMERIC(10,2)
);
"""


# --------------------------------------------------
# CSV LOADER
# --------------------------------------------------

def load_csv(filename):
    path = DATA_DIR / filename

    with open(path, newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


# --------------------------------------------------
# MAIN
# --------------------------------------------------

def main():

    print("Connecting to PostgreSQL...")

    conn = psycopg2.connect(DATABASE_URL)

    try:

        with conn.cursor() as cur:

            print("Creating tables...")

            cur.execute(DDL)

            # Clear old data in the correct order
            print("Clearing existing travel data...")

            cur.execute("""
                TRUNCATE
                    reviews,
                    bookings,
                    activities,
                    hotels,
                    customers,
                    destinations
                CASCADE
            """)

            # ------------------------------------------
            # DESTINATIONS
            # ------------------------------------------

            rows = load_csv("destinations.csv")

            cur.executemany(
                """
                INSERT INTO destinations
                (destination_id, destination_name, state, country, category)
                VALUES
                (%(destination_id)s,
                 %(destination_name)s,
                 %(state)s,
                 %(country)s,
                 %(category)s)
                """,
                rows
            )

            print(f"Loaded {len(rows)} destinations")


            # ------------------------------------------
            # HOTELS
            # ------------------------------------------

            rows = load_csv("hotels.csv")

            cur.executemany(
                """
                INSERT INTO hotels
                (hotel_id, hotel_name, destination_id,
                 price_per_night, rating)
                VALUES
                (%(hotel_id)s,
                 %(hotel_name)s,
                 %(destination_id)s,
                 %(price_per_night)s,
                 %(rating)s)
                """,
                rows
            )

            print(f"Loaded {len(rows)} hotels")


            # ------------------------------------------
            # CUSTOMERS
            # ------------------------------------------

            rows = load_csv("customers.csv")

            cur.executemany(
                """
                INSERT INTO customers
                (customer_id, name, city, state)
                VALUES
                (%(customer_id)s,
                 %(name)s,
                 %(city)s,
                 %(state)s)
                """,
                rows
            )

            print(f"Loaded {len(rows)} customers")


            # ------------------------------------------
            # BOOKINGS
            # ------------------------------------------

            rows = load_csv("bookings.csv")

            cur.executemany(
                """
                INSERT INTO bookings
                (booking_id, customer_id, hotel_id,
                 check_in, check_out, guests, status)
                VALUES
                (%(booking_id)s,
                 %(customer_id)s,
                 %(hotel_id)s,
                 %(check_in)s,
                 %(check_out)s,
                 %(guests)s,
                 %(status)s)
                """,
                rows
            )

            print(f"Loaded {len(rows)} bookings")


            # ------------------------------------------
            # REVIEWS
            # ------------------------------------------

            rows = load_csv("reviews.csv")

            cur.executemany(
                """
                INSERT INTO reviews
                (review_id, customer_id, hotel_id,
                 rating, review_date)
                VALUES
                (%(review_id)s,
                 %(customer_id)s,
                 %(hotel_id)s,
                 %(rating)s,
                 %(review_date)s)
                """,
                rows
            )

            print(f"Loaded {len(rows)} reviews")


            # ------------------------------------------
            # ACTIVITIES
            # ------------------------------------------

            rows = load_csv("activities.csv")

            cur.executemany(
                """
                INSERT INTO activities
                (activity_id, destination_id,
                 activity_name, activity_type, price)
                VALUES
                (%(activity_id)s,
                 %(destination_id)s,
                 %(activity_name)s,
                 %(activity_type)s,
                 %(price)s)
                """,
                rows
            )

            print(f"Loaded {len(rows)} activities")


        conn.commit()

        print("\nTravel & Tourism data loaded successfully!")


    except Exception as error:

        conn.rollback()

        print("\nERROR:")
        print(error)

        raise


    finally:

        conn.close()


# --------------------------------------------------
# RUN
# --------------------------------------------------

if __name__ == "__main__":
    main()