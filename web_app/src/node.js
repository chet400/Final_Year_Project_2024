// server.js

const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = 3301;
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'chetan',
  database: 'data_flow_pro'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database as id ' + connection.threadId);
});

app.get('/data', (req, res) => {
  connection.query('SELECT * FROM data', (err, results) => {
    if (err) {
      console.error('Error executing query: ' + err.stack);
      res.status(500).send('Error fetching data from database');
      return;
    }
    res.json(results);
  });
});
app.get('/data/:id', (req, res) => {
    console.log("Debugging")
    const id = req.params.id;
    connection.query('SELECT * FROM data WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error executing query: ' + err.stack);
        res.status(500).send('Error fetching data from database');
        return;
      }
      if (results.length === 0) {
        res.status(404).send('Data not found');
        return;
      }
      res.json(results[0]);
    });
  });
  
app.post('/data', (req, res) => {
    const { table, data } = req.body;
    const columns = Object.keys(data).join(',');
    const values = Object.values(data).map(value => `'${value}'`).join(',');
    const query = `INSERT INTO ${table} (${columns}) VALUES (${values})`;
    console.log({table},{columns},{values})
    connection.query(query, (err, result) => {
      if (err) {
        console.error('Error executing query: ' + err.stack);
        res.status(500).send('Error inserting data into database');
        return;
      }
      res.json({ message: 'Data inserted successfully', id: result.insertId });
    });
  });

  
  app.put('/data/:id', (req, res) => {
    const { id } = req.params;
    const { key, value } = req.body;
    console.log("body",req.body)
    if (!key || !value) {
        res.status(400).send('Key and value are required for updating');
        return;
    }

    const query = `UPDATE data SET ${key} = '${value}' WHERE id = ${id}`;

    connection.query(query, (err, result) => {
        if (err) {
            console.error('Error executing query: ' + err.stack);
            res.status(500).send('Error updating data');
            return;
        }
        res.json({ message: 'Data updated successfully' });
    });
});


  app.delete('/data/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM data WHERE id = ?', [id], (err, results) => {
      if (err) {
        console.error('Error executing query: ' + err.stack);
        res.status(500).send('Error deleting data');
        return;
      }
      res.json({ message: 'Data deleted successfully' });
    });
  });
  


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
