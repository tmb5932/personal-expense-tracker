from flask import Flask, request, jsonify, render_template
import sqlite3
import base64

# Configuration
app = Flask(__name__)
DATABASE = 'budget.db'

# Initialize database
def init_db():
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS purchases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                amount REAL NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                photo BLOB
            )
        ''')
        conn.commit()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/add', methods=['POST'])
def add_purchase():
    # Get form data
    date = request.form.get('date')
    amount = request.form.get('amount')
    category = request.form.get('category')
    description = request.form.get('description')
    photo_file = request.files.get('photo')

    # Convert photo to binary if provided
    photo_blob = None
    if photo_file:
        photo_blob = photo_file.read()  # Read file as binary

    # Insert data into database
    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO purchases (date, amount, category, description, photo)
                VALUES (?, ?, ?, ?, ?)
            ''', (date, amount, category, description, photo_blob))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'success': False, 'error': str(e)})

@app.route('/month-data', methods=['GET'])
def get_month_data():
    # Fetch all purchases
    try:
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT date, amount, category, description, photo FROM purchases')
            purchases = []
            for row in cursor.fetchall():
                photo_b64 = None
                if row[4]:  # Convert photo BLOB to base64
                    photo_b64 = base64.b64encode(row[4]).decode('utf-8')
                purchases.append({
                    'date': row[0],
                    'amount': row[1],
                    'category': row[2],
                    'description': row[3],
                    'photo': photo_b64
                })
        return jsonify(purchases)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)