import sqlite3 # SQLite library for database operations
import time # Time library for sleep function
import json # JSON library for reading/writing JSON files
from datetime import date, datetime # datetime library for handling date and time
from pathlib import Path # Pathlib library for handling file paths



# This script is used for debugging purposes and simulates door events using sleep instead of actual GPIO events.
# Do not upload this file to the Raspberry Pi as it does not use GPIO pins and won't work with the actual door.
# It is recommended to use this script when making changes to the program before deploying it to the actual hardware.



# Path to the SQLite database file
DATABASE_FILE = "./BackEnd/club_room_data.db"
# Path to the JSON file storing the current door status and timestamps
CURRENT_STATUS_FILE = "./FrontEnd/js/current_status.json"



# Returns the current timestamp in seconds (used for logging open/close times)
def get_timestamp():
    return int(datetime.now().timestamp())



# Returns today's date as a string in 'dd-mm-yyyy' format
def get_today_date():
    return date.today().strftime('%d-%m-%Y')



# Checks if the current_status.json file exists and is not empty.
# If it doesn't exist or is empty, creates it with default values.
# Returns the loaded JSON data as a dictionary.
def get_status_data():
    status_path = Path(CURRENT_STATUS_FILE)

    # Creates the file with default status if missing or empty
    if not status_path.exists() or status_path.stat().st_size == 0:
        with open(CURRENT_STATUS_FILE, 'w') as f:
            json.dump({"current_status": {
                "isOpen": 0,        # 0 = closed, 1 = open
                "lastOpened": 0,    # Timestamp of last opening
                "lastClosed": 0     # Timestamp of last closing
            }}, f)
        print("Current status JSON created")

    # Loads and returns the current status data
    with open(CURRENT_STATUS_FILE, 'r') as f:
        data = json.load(f)
    
    return data



# Updates the current_status.json file with the latest door status and timestamps.
# door_current_status: 1 if open, 0 if closed.
def update_current_status(door_current_status):
    current_data = get_status_data()
    now = get_timestamp()

    # Updates the status (whether the door is open or closed)
    current_data["current_status"]["isOpen"] = door_current_status
    if door_current_status == 1:
        # Updates lastOpened timestamp if the door is opened
        current_data["current_status"]["lastOpened"] = now
    else:
        # Updates lastClosed timestamp if the door is closed
        current_data["current_status"]["lastClosed"] = now

    # Dumps the updated status data back to the JSON file
    with open(CURRENT_STATUS_FILE, 'w') as f:
        json.dump(current_data, f)



# Initializes the SQLite database and creates tables if they do not exist.
def initialize_db():
    try:
        # Creates a new database or connects to an existing one
        with sqlite3.connect(DATABASE_FILE) as conn:
            c = conn.cursor()

            # Creates a table for storing dates if it doesn't already exist
            c.execute('''
                CREATE TABLE IF NOT EXISTS dates (
                    id INTEGER PRIMARY KEY,
                    date TEXT UNIQUE NOT NULL
                )
            ''')

            # Creates a table for storing door opening and closing times if it doesn't already exist
            # This table takes a foreign key reference to the dates table to link events to specific dates (date_id)
            c.execute('''
                CREATE TABLE IF NOT EXISTS openings (
                    date_id INTEGER NOT NULL,
                    opening_time INTEGER NOT NULL,
                    closing_time INTEGER NOT NULL,
                    FOREIGN KEY (date_id) REFERENCES dates(id)
                )
            ''')

            # Commits the changes to the database
            conn.commit()

    except Exception as e:
        print(f"[ERROR] Failed to log data: {e}")



# Logs an opening/closing event to the database for the given date.
# date_str: date string in 'dd-mm-yyyy' format.
def log_opening_to_db(date_str):
    try:
        with sqlite3.connect(DATABASE_FILE) as conn:
            c = conn.cursor()

            # Gets the latest opening and closing times from the status file
            current_data = get_status_data()
            opening_time = current_data["current_status"]["lastOpened"]
            closing_time = current_data["current_status"]["lastClosed"]

            # Checks if the date already exists in the dates table
            c.execute("SELECT id FROM dates WHERE date = ?", (date_str,))
            # fetchone() retrieves the first row of the result set, which contains the date ID
            row = c.fetchone()
            
            if row is not None:
                # If the date exists, gets its ID and assigns it to date_id
                date_id = row[0]
            else:
                # Inserts new date if not found in the dates table
                c.execute("INSERT INTO dates (date) VALUES (?)", (date_str,))
                # Fetches the ID of the newly inserted date and assigns it to date_id
                date_id = c.lastrowid

            # Inserts the opening/closing event
            c.execute(
                "INSERT INTO openings (date_id, opening_time, closing_time) VALUES (?, ?, ?)",
                (date_id, opening_time, closing_time)
            )
            conn.commit()
            print(f"[SAVED] {date_str} | Open: {opening_time}, Close: {closing_time}")

    except sqlite3.OperationalError as e:
        print("SQLite error:", e)



# Handler for when the door is opened (button/magnetic switch released)
def door_opened():
    update_current_status(1)
    print(f"Door opened")



# Handler for when the door is closed (button/magnetic switch pressed)
# Only logs the closing time if there was a valid opening event in the JSON file.
def door_closed():
    current_data = get_status_data()

    # Only logs closing time if there was a valid opening event
    if current_data["current_status"]["lastOpened"] in (None, 0):
        print(f"Door opening time not found, not recording closing time")
    elif current_data["current_status"]["isOpen"] == 0:
        print(f"Door is already closed, not recording closing time")
    else:
        print(f"Door closed")
        today = get_today_date()
        update_current_status(0)
        log_opening_to_db(today)



# Main program starts here

# Initializes the SQLite database and creates tables if they do not exist
initialize_db()

# Simulates door events for testing purposes
# In a real-world scenario, these would be triggered by GPIO events
door_opened()
time.sleep(1)
door_closed()
time.sleep(3)
door_opened()
time.sleep(1)
door_closed()