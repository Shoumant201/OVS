import psycopg2
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()

# Database connection parameters
DB_PARAMS = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT")  # Typically 5432 for PostgreSQL
}

# Connect to the PostgreSQL database
def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        return conn
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        return None

# Function to update election status
def update_election_status():
    # Connect to the database
    conn = get_db_connection()
    if not conn:
        return

    cur = conn.cursor()

    # Get all elections
    cur.execute("SELECT id, start_date, end_date, launched, status FROM elections")
    elections = cur.fetchall()

    # Get current date and time
    now = datetime.now()

    for election in elections:
        election_id, start_date, end_date, launched, status = election

        # Default status update logic
        if start_date > now:
            # Before start_date
            if launched:
                new_status = 'scheduled'
            else:
                new_status = 'building'
        elif start_date <= now <= end_date:
            # Between start_date and end_date
            if launched:
                new_status = 'ongoing'
            else:
                new_status = 'cancelled'
        elif end_date < now:
            # After end_date
            if launched:
                new_status = 'finished'
            else:
                new_status = 'cancelled'

        # Only update if the status needs to be changed
        if new_status != status:
            print(f"Updating election {election_id} status from {status} to {new_status}")
            cur.execute("""
                UPDATE elections
                SET status = %s
                WHERE id = %s
            """, (new_status, election_id))
            conn.commit()

    # Close the cursor and connection
    cur.close()
    conn.close()

# Run the function to update election status
update_election_status()
