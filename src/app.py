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
                business TEXT NOT NULL,
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

@app.route('/add')
def add_page():
    return render_template('add.html')

@app.route('/recent')
def recent_page():
    return render_template('recent.html')

@app.route('/monthly')
def monthly_page():
    return render_template('monthly.html')

@app.route('/add', methods=['POST'])
def add_purchase():
    # Get form data
    date = request.form.get('date')
    business = request.form.get('business')
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
                INSERT INTO purchases (date, business, amount, category, description, photo)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (date, business, amount, category, description, photo_blob))
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
            cursor.execute('SELECT date, business, amount, category, description, photo FROM purchases ORDER BY date DESC')
            purchases = []
            for row in cursor.fetchall():
                photo_b64 = None
                if row[5]:  # Convert photo BLOB to base64
                    photo_b64 = base64.b64encode(row[5]).decode('utf-8')
                purchases.append({
                    'date': row[0],
                    'business': row[1],
                    'amount': row[2],
                    'category': row[3],
                    'description': row[4],
                    'photo': photo_b64
                })
        return jsonify(purchases)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)})

@app.route('/overview-data', methods=['GET'])
def get_overview_data():
    # Fetch all purchases
    try:
        sort_by = request.args.get('sort')
        if not sort_by:
            sort_by = 'DESC'

        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            query = f'''
                SELECT strftime('%Y-%m', date) AS month, SUM(amount) AS total_amount
                FROM purchases
                GROUP BY month
                ORDER BY month {sort_by}
            '''
            cursor.execute(query)
            monthly_totals = []
            for row in cursor.fetchall():
                monthly_totals.append({
                    'month': row[0],
                    'total': row[1]
                })
        return jsonify(monthly_totals)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)})

@app.route('/monthly-category-data', methods=['GET'])
def get_monthly_category_data():
    try:
        month = request.args.get('month')
        if not month:
            query = '''
                SELECT strftime('%Y-%m', date) AS month, category, SUM(amount) AS category_amount
                FROM purchases
                GROUP BY category
                ORDER BY category_amount DESC
            '''
        else:
            query = '''
                SELECT strftime('%Y-%m', date) AS month, category, SUM(amount) AS category_amount
                FROM purchases
                WHERE strftime('%Y-%m', date) = ?
                GROUP BY category
                ORDER BY category_amount DESC
            '''

        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            
            if not month:
                cursor.execute(query)
            else:
                cursor.execute(query, (month,))
            
            monthly_category_totals = []
            for row in cursor.fetchall():
                monthly_category_totals.append({
                    'category': row[1],
                    'category_amount': row[2]
                })
        return jsonify(monthly_category_totals)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000)