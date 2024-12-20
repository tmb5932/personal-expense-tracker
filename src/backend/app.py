from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

# Database initialization
def init_db():
    conn = sqlite3.connect('budget.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS purchases (
            id INTEGER PRIMARY KEY NOT NULL,
            date TEXT NOT NULL,
            amount REAL NOT NULL,
            category TEXT,
            description TEXT,
            photo BLOB
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def home():
    # Fetch current month's spending
    return render_template('home.html')

@app.route('/add', methods=['POST'])
def add_purchase():
    # Add purchase to the database
    return jsonify({"success": True})

@app.route('/month/<int:year>/<int:month>')
def view_month(year, month):
    # Fetch and return purchases for the month
    return render_template('month.html')

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)