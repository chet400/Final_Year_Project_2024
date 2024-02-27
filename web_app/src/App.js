import React, { useState, useEffect } from 'react';
import './App.css';
const App = () => {
  const [data, setData] = useState([]);
  const [formData, setFormData] = useState({});
  const [tableName, setTableName] = useState('data');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [formFields, setFormFields] = useState(null); 

  const [isFormVisible, setFormVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch('http://localhost:3301/data')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data: ' + error));
  };

  const handleCreate = () => {
    fetch('http://localhost:3301/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ table: tableName, data: formData })
  
  })
    .then(() => {
      setFormVisible(false);
      setFormData({});
      fetchData();
    })
    .catch(error => console.error('Error creating data: ' + error));
  };

 
    
  const handleUpdate = (id) => {
    
    const newDataString = prompt('Enter new data (column1="value1", column2="value2", ...):');
    const newData = Object.fromEntries(newDataString.split(',').map(item => {
        const [key, value] = item.split('=').map(part => part.trim());
        return [key, value];
    }));
    
    fetch(`http://localhost:3301/data/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ table: 'data', data: newData })
    })
    .then(() => fetchData())
    .catch(error => console.error('Error updating data: ' + error));
};


  const handleDelete = (id) => {
    fetch(`http://localhost:3301/data/${id}`, {
      
      method: 'DELETE'
    })
    .then(() => fetchData())
    .catch(error => console.error('Error deleting data: ' + error));
  };
  const renderForm = () => {
    if (!isFormVisible) return null;
    if (data.length === 0) {
      return <p>No data available to generate form.</p>;
    }
    
    // Access the first element of the data array to get the available keys (columns)
    const tableKeys = Object.keys(data[0]);
    return (
      <div className="form-container">
        <input type="text" value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="Table Name" className="form-input" />
        
        
        {tableKeys.map((key, index) => {
          return (
            
            <div key={index} className="form-input">
                <label htmlFor={key}>{key}</label>
              <input type="text" value={formData[key]} onChange={(e) => setFormData({...formData, [key]: e.target.value})} placeholder={key} />
            </div>
          );
        })}
        <div className="form-submit">
          <button onClick={handleCreate}>Create</button>
         <h1>  </h1>
          <button onClick={() => setFormVisible(false)}>Close</button>
        </div>
      </div>
    );
  };
  
  const filterNullKeys = (obj) => {
    return Object.keys(obj).filter(key => obj[key] !== null);
  };
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  return (
    <div>
      <h1>Data</h1>
      <button className="styled-button" onClick={() => setFormVisible(true)}>Add Data</button>
      {renderForm()}
      <table className="styled-table">
        <thead>
          <tr>
            {data.length > 0 &&
              filterNullKeys(data[0]).map((key, index) => (
                <th key={index}>{key}</th>
              ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((item, index) => (
            <tr key={index}>
              {filterNullKeys(item).map((key, index) => (
                <td key={index}>{item[key]}</td>
              ))}
              <td>
                <button className="styled-button" onClick={() => handleUpdate(item.id)}>Update</button>
                <button className="styled-button1" onClick={() => handleDelete(item.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={data.length}
        paginate={paginate}
        currentPage={currentPage}
      />
     
    </div>  );
};

const Pagination = ({ itemsPerPage, totalItems, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalItems / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className='pagination'>
        {pageNumbers.map(number => (
          <li key={number} className='page-item'>
            <a onClick={() => paginate(number)} href='!#' className={number === currentPage ? 'active' : ''}>
              {number}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};


export default App;
