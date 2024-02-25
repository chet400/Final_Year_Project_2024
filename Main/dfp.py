# Import necessary libraries and modules
from flask import Flask, request, render_template
import os
from flask_sqlalchemy import SQLAlchemy

# Create a Flask application instance
app = Flask(__name__)

# Define the upload folder
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configure database connection URI
DB_URI = "mysql://root:ayush123@localhost/data_flow_pro"

# Initialize SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = DB_URI
db = SQLAlchemy(app)

# Define table model
class Data(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Define dynamic columns based on uploaded CSV
    def __init__(self, **kwargs):
        for column, value in kwargs.items():
            setattr(self, column, value)

# Define routes
@app.route('/')
def index():
    return render_template('upload.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    # Handle file upload for CSV file
    if 'file' not in request.files:
        return "No file part"
    csv_file = request.files['file']
    
    # Save the uploaded CSV file
    csv_file_path = os.path.join(app.config['UPLOAD_FOLDER'], csv_file.filename)
    csv_file.save(csv_file_path)
    
    # Read the CSV file to get column names
    try:
        with open(csv_file_path, 'r') as file:
            header = file.readline().strip().split(',')
    except Exception as e:
        return str(e)

    # Create a table based on the CSV file columns
    try:
        # Extract table name from the file name
        table_name = os.path.splitext(csv_file.filename)[0]

        # Create dynamic columns
        for column in header:
            setattr(Data, column, db.Column(db.String(255)))

        # Create all tables
        db.create_all()

        # Upload data
        with open(csv_file_path, 'r') as file:
            next(file)  # Skip header
            for line in file:
                data = line.strip().split(',')
                row = Data(**dict(zip(header, data)))
                db.session.add(row)
                db.session.commit()

        return "Data uploaded successfully!"
    except Exception as e:
        return str(e)

# Run the Flask application
if __name__ == '__main__':
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)
