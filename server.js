const express = require('express');
const axios = require('axios');
const auth = require('basic-auth');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const API_BASE_URL = process.env.API_BASE_URL;
const LOGIN = process.env.LOGIN;
const PASSWORD = process.env.PASSWORD;


const app = express();
const port = process.env.PORT || 3000;

const mysql = require('mysql');
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  charset: 'utf8'
};

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(dbConfig);

  connection.connect(function(err) {
    if (err) {
      console.log('Error connecting to database:', err);
      setTimeout(handleDisconnect, 2000);
    }
  });

  connection.on('error', function(err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

function executeDatabaseQuery(query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

async function makeAuthenticatedGetRequest(url) {
  const response = await axios.get(url, {
    auth: {
      username: LOGIN,
      password: PASSWORD
    }
  });
  //console.log(response.data);
  return response.data;
}

async function updateCategoryData() {
  try {
    console.log('Updating category data started');
    const categoriesData = await makeAuthenticatedGetRequest(API_BASE_URL + 'categories');
    const markNotReturnedCategoriesQuery = "UPDATE categories SET selectable = 0";
    await executeDatabaseQuery(markNotReturnedCategoriesQuery);
    for (const category of categoriesData) {
      const { guid, name, code } = category;
      const existingCategoryQuery = `SELECT id FROM categories WHERE guid = '${guid}'`;
      const existingCategoryResult = await executeDatabaseQuery(existingCategoryQuery);
      if (existingCategoryResult.length > 0) {
        const updateQuery = `UPDATE categories SET name = '${name}', code = '${code}', selectable = 1 WHERE guid = '${guid}'`;
        await executeDatabaseQuery(updateQuery);
      } else {
        const insertQuery = `INSERT INTO categories (guid, name, code, selectable) VALUES ('${guid}', '${name}', '${code}', 1)`;
        await executeDatabaseQuery(insertQuery);
      }
    }
  } catch (error) {
    console.error('Error updating category data:', error);
  }
  console.log('Updating category data finished');
}



async function updatePriceData() {
    try {
      console.log('Updating price data started');
      const priceData = await makeAuthenticatedGetRequest(API_BASE_URL + 'prices');
      const markNotReturnedPricesQuery = "UPDATE prices SET selectable = 0";
      await executeDatabaseQuery(markNotReturnedPricesQuery);
      for (const priceEntry of priceData) {
        const { product, price } = priceEntry;
        const existingProductQuery = `SELECT id FROM prices WHERE product_guid = '${product}'`;
        const existingProductResult = await executeDatabaseQuery(existingProductQuery);
      if (existingProductResult.length > 0) {
        const updateQuery = `UPDATE prices SET price = ${price}, selectable = 1 WHERE product_guid = '${product}'`;
        await executeDatabaseQuery(updateQuery);
      } else {
        const insertQuery = `INSERT INTO prices (product_guid, price, selectable) VALUES ('${product}', ${price}, 1)`;
        await executeDatabaseQuery(insertQuery);
      }
    }
  } catch (error) {
    console.error('Error updating price data:', error);
  }
  console.log('Updating price data finished');
 }
 

async function updateEmployeeData() {
  try {
    console.log('Updating employee data started');
    const employeesData = await makeAuthenticatedGetRequest(API_BASE_URL + 'employees');
    const markNotReturnedEmployeesQuery = "UPDATE employees SET selectable = 0";
    await executeDatabaseQuery(markNotReturnedEmployeesQuery);
    for (const employee of employeesData) {
      const { guid, name, code } = employee;
      const existingEmployeeQuery = `SELECT id FROM employees WHERE guid = '${guid}'`;
      const existingEmployeeResult = await executeDatabaseQuery(existingEmployeeQuery);
      if (existingEmployeeResult.length > 0) {
        const updateQuery = `UPDATE employees SET name = '${name}', code = '${code}', selectable = 1 WHERE guid = '${guid}'`;
        await executeDatabaseQuery(updateQuery);
      } else {
        const insertQuery = `INSERT INTO employees (guid, name, code, selectable) VALUES ('${guid}', '${name}', '${code}', 1)`;
        await executeDatabaseQuery(insertQuery);
      }
    }
  } catch (error) {
    console.error('Error updating employee data:', error);
  }
  console.log('Updating employee data finished');
}

async function updateProductData() {
  try {
  console.log('Updating product data started');
  const productsData = await makeAuthenticatedGetRequest(API_BASE_URL + 'products');
  const markNotReturnedProductsQuery = "UPDATE products SET selectable = 0";
  await executeDatabaseQuery(markNotReturnedProductsQuery);
  for (const product of productsData) {
  const { guid, name, code, articul, category, measurementUnit } = product;
  const existingProductQuery = `SELECT id FROM products WHERE guid = '${guid}'`;
  const existingProductResult = await executeDatabaseQuery(existingProductQuery);
  if (existingProductResult.length > 0) {
  const updateQuery = `UPDATE products SET name = '${name}', code = '${code}', articul = '${articul}', category_guid = '${category}', measurement_unit = '${measurementUnit}', selectable = 1 WHERE guid = '${guid}'`;
  await executeDatabaseQuery(updateQuery);
  } else {
  const insertQuery = `INSERT INTO products (guid, name, code, articul, category_guid, measurement_unit, selectable) VALUES ('${guid}', '${name}', '${code}', '${articul}', '${category}', '${measurementUnit}', 1)`;
  await executeDatabaseQuery(insertQuery);
  }
  }
  } catch (error) {
  console.error('Error updating product data:', error);
  }
  console.log('Updating product data finished');
 }
 

async function updateRestsData() {
  try {
    console.log('Updating rests data started');
    const restsData = await makeAuthenticatedGetRequest(API_BASE_URL + 'rests');
    const markNotReturnedRestsQuery = "UPDATE rests SET selectable = 0";
    await executeDatabaseQuery(markNotReturnedRestsQuery);
    for (const rest of restsData) {
      const { id, warehouse_guid, product_guid, quantity, created_at, updated_at } = rest;
      const existingRestQuery = `SELECT id FROM rests WHERE product_guid = '${product_guid}'`;
      const existingRestResult = await executeDatabaseQuery(existingRestQuery);
      if (existingRestResult.length > 0) {
        const updateQuery = `UPDATE rests SET warehouse_guid = '${warehouse_guid}', product_guid = '${product_guid}', quantity = '${quantity}', selectable = 1 WHERE id = '${id}'`;
        await executeDatabaseQuery(updateQuery);
      } else {
        const insertQuery = `INSERT INTO rests (warehouse_guid, product_guid, quantity, created_at, updated_at, selectable) VALUES ('${warehouse_guid}', '${product_guid}', '${quantity}', '${created_at}', '${updated_at}', 1)`;
        await executeDatabaseQuery(insertQuery);
      }
    }
  } catch (error) {
    console.error('Error updating rests data:', error);
  }
  console.log('Updating rests data finished');
}

async function updateOrderStatus() {
  try {
    const orderStatus = await makeAuthenticatedGetRequest(API_BASE_URL + 'status');
  } catch (error) {
    console.error('Error updating order status data:', error);
  }
}

async function updateStoreData() {
  try {
    console.log('Updating stores data started');
    const storesData = await makeAuthenticatedGetRequest(API_BASE_URL + 'stores');
    const markNotReturnedStoresQuery = "UPDATE stores SET selectable = 0";
    await executeDatabaseQuery(markNotReturnedStoresQuery);
    for (const store of storesData) {
      const { guid, name, code } = store;
      const existingStoreQuery = `SELECT id FROM stores WHERE guid = '${guid}'`;
      const existingStoreResult = await executeDatabaseQuery(existingStoreQuery);
      if (existingStoreResult.length > 0) {
        const updateQuery = `UPDATE stores SET name = '${name}', code = '${code}', selectable = 1 WHERE guid = '${guid}'`;
        await executeDatabaseQuery(updateQuery);
      } else {
        const insertQuery = `INSERT INTO stores (guid, name, code, selectable) VALUES ('${guid}', '${name}', '${code}', 1)`;
        await executeDatabaseQuery(insertQuery);
      }
    }
  } catch (error) {
    console.error('Error updating store data:', error);
  }
  console.log('Updating stores data finished');
}


app.use(bodyParser.json());

async function getCategoryData(req) {
  try {
    const guid = req.query.guid;
    const name = req.query.name;
    const code = req.query.code;
    let query = 'SELECT id, code, name, guid, created_at, updated_at FROM categories WHERE selectable = 1';
    if (guid) {
      query += ` AND guid = '${guid}'`;
    }
    if (name) {
      query += ` AND name = '${name}'`;
    }
    if (code) {
      query += ` AND code = '${code}'`;
    }
    const queryResult = await executeDatabaseQuery(query);
    return queryResult;
  } catch (error) {
    throw new Error('Failed to retrieve category data');
  }
}
app.get('/categories', async (req, res) => {
  try {
    const categories = await getCategoryData(req);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

async function getPriceData(req) {
  try {
    const product = req.query.product;
    let query = 'SELECT id, product_guid, price, created_at, updated_at FROM categories WHERE selectable = 1';
    if (product) {
      query += ` AND product_guid = '${product}'`;
    }
    // Execute the SQL query
    const queryResult = await executeDatabaseQuery(query);

    // Return the retrieved categories
    return queryResult;
  } catch (error) {
    throw new Error('Failed to retrieve price data');
  }
}


app.get('/prices', async (req, res) => {
  try {
      const prices = await getPriceData(req);
      res.json(prices);
  } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
  }
});

async function getEmployeeData(req) {
  try {
    const guid = req.query.guid;
    const name = req.query.name;
    const code = req.query.code;
    let query = 'SELECT * FROM employees WHERE selectable = 1';
    if (guid) {
      query += ` AND guid = '${guid}'`;
    }
    if (name) {
      query += ` AND name = '${name}'`;
    }
    if (code) {
      query += ` AND code = '${code}'`;
    }
    const queryResult = await executeDatabaseQuery(query);
    return queryResult;
  } catch (error) {
    throw new Error('Failed to retrieve employee data');
  }
}

app.get('/employees', async (req, res) => {
  try {
    const employees = await getEmployeeData(req);
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

async function getProductData(req) {
  try {
    const guid = req.query.guid;
    const name = req.query.name;
    const code = req.query.code;
    const articul = req.query.articul;
    const category = req.query.category;

    let query = 'SELECT * FROM products WHERE selectable = 1';

    if (guid) {
      query += ` AND guid = '${guid}'`;
    }

    if (name) {
      query += ` AND name = '${name}'`;
    }

    if (code) {
      query += ` AND code = '${code}'`;
    }

    if (articul) {
      query += ` AND articul = '${articul}'`;
    }

    if (category) {
      query += ` AND category = '${category}'`;
    }

    const queryResult = await executeDatabaseQuery(query);
    return queryResult;
  } catch (error) {
    throw new Error('Failed to retrieve product data');
  }
}

app.get('/products', async (req, res) => {
  try {
    const products = await getProductData(req);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});


async function getRestsData(req) {
  try {
    const warehouse = req.query.warehouse;
    const product = req.query.product;
    let query = 'SELECT * FROM rests WHERE selectable = 1';

    if (warehouse) {
      query += ` AND warehouse_guid = '${warehouse}'`;
    }

    if (product) {
      query += ` AND product_guid = '${product}'`;
    }
    const queryResult = await executeDatabaseQuery(query);
    return queryResult;
  } catch (error) {
    throw new Error('Failed to retrieve product data');
  }
}

app.get('/rests', async (req, res) => {
  try {
      const rests = await getRestsData(req);
      res.json(rests);
  } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
  }
});

async function getStoreData(req) {
  try {
    // Parse the query parameters to determine the filtering options
    const guid = req.query.guid;
    const name = req.query.name;
    const code = req.query.code;
    let query = 'SELECT id, code, name, guid, created_at, updated_at FROM stores WHERE selectable = 1';
    if (guid) {
      query += ` AND guid = '${guid}'`;
    }
    if (name) {
      query += ` AND name = '${name}'`;
    }
    if (code) {
      query += ` AND code = '${code}'`;
    }
    const queryResult = await executeDatabaseQuery(query);
    return queryResult;
  } catch (error) {
    throw new Error('Failed to retrieve store data');
  }
}

app.get('/stores', async (req, res) => {
  try {
    const stores = await getStoreData(req);
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});
  

  

app.get('/status', async (req, res) => {
  try {
    // Extract the necessary data from the request query parameters
    const { number, date, dealId } = req.query;
    
    // Prepare the data for the GET request to the remote API
    const requestData = {
      number,
      date,
      dealId
    };
    
    // Make the GET request to the remote API
    const response = await axios.get(`${remoteAPIBaseUrl}status`, {
      params: requestData
    });
    
    // Extract the order status data from the response
    const orderStatus = response.data;
    
    // Update the corresponding order record in the database based on the dealId
    const updateQuery = `
      UPDATE orders 
      SET 
        status = '${orderStatus.status}',
        closed = ${orderStatus.closed ? 1 : 0},
        dateCompleted = '${orderStatus.dateCompleted}'
      WHERE dealId = ${dealId};
    `;
    
    connection.query(updateQuery, (error, results) => {
      if (error) {
        console.error('Error updating order record:', error);
        res.status(500).json({ error: 'An error occurred' });
      } else {
        console.log('Order record updated successfully');
        res.json({ message: 'Order record updated successfully' });
      }
    });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

  
app.post('/order', async (req, res) => {
    try {
      // Extract the necessary data from the request body
      const { date, client, contactPerson, legalType, tin, clientId, phone, responsible, warehouse, conditions, description, representative, product, quantity, price, dealId } = req.body;
  
      // Prepare the data for the POST request to the remote API
      const orderData = {
        date,
        client,
        contactPerson,
        legalType,
        tin,
        clientId,
        phone,
        responsible,
        warehouse,
        conditions,
        description,
        representative,
        product,
        quantity,
        price,
        dealId
      };
      const response = await axios.post(`${remoteAPIBaseUrl}order`, orderData);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  
  function authenticate(req, res, next) {
    const credentials = auth(req);
  
    if (!credentials || credentials.name !== 'WebUser' || credentials.pass !== 'qas543') {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Please enter your username and password"');
      res.end('Access denied');
    } else {
      next();
    }
  }

  app.post('/webhook', authenticate, (req, res) => {
    const { number, date, status, closed, dateCompleted, dealId } = req.body;
    console.log('webhook received, started processing')
    const updateQuery = `UPDATE orders SET status = '${status}', closed = ${closed ? 1 : 0}, dateCompleted = '${dateCompleted}' WHERE dealId = ${dealId};`;
    connection.query(updateQuery, (error, results) => {
      if (error) {
        console.error('Error updating order record:', error);
      } else {
        console.log('Order record updated successfully');
      }
    });
    res.sendStatus(200);
    console.log('webhook received, finished processing')
  });
  

  function updateData() {
    console.log('Updating data...');
    updateCategoryData();
    updatePriceData();
    updateProductData();
    updateEmployeeData();
    updateRestsData();
    updateStoreData();
    
  }
  
  // Function to schedule updates
  function scheduleUpdates() {
    // Run updates on server startup
    updateData();
  
    // Schedule updates every 6 hours (in milliseconds)
    const updateInterval = 6 * 60 * 60 * 1000;
    setInterval(() => {
      updateData();
    }, updateInterval);
  }
  
  // Start the server and schedule updates
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    scheduleUpdates();
  });

  module.exports = app;