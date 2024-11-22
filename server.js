
// // --------------------------final registration and login-------------------

const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); // For hashing passwords
const path = require('path');

const app = express();
const port = 3000;

// Middleware to parse incoming form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//MySQL database connection setup
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // Your MySQL username
  password: 'root',        // Your MySQL password (leave blank if no password)
  database: 'db1'      // Your database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database');
});

// Registration route - Handles POST request from the registration form
app.post('/submit', (req, res) => {
  const { username, email, phone, birth_date, password } = req.body;

  if (!username || !email || !phone || !birth_date || !password) {
    return res.status(400).send('Please fill all the required fields.');
  }

  // Hash the password before storing it
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send('Error while hashing password.');
    }

    // Insert the new user into the database
    const sql = `INSERT INTO users (username, email, phone, birth_date, password) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [username, email, phone, birth_date, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).send('Email is already registered.');
        }
        return res.status(500).send('Database error.');
      }

      res.send('User registered successfully!');
    });
  });
});

// Login route - Handles POST request from the login form
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Please provide both email and password.');
  }

  // Check if the user exists in the database
  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [email], (err, result) => {
    if (err) {
      return res.status(500).send('Database error2.');
    }

    if (result.length === 0) {
      return res.status(404).send('User not found.');
    }

    const user = result[0];

    // Compare the provided password with the hashed password in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).send('Error while comparing passwords.');
      }

      if (isMatch) {
        return res.send('Login successful!');
      } else {
        return res.status(400).send('Invalid email or password.');

        
      }
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// ------------------registration and login ends---------------------------

// -------------------------contact us form starts-----------------------


// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL Database Connection
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',       // your MySQL username
//   password: 'root',   // your MySQL password
//   database: 'db1'     // your MySQL database name
// });

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Route to handle form submission
app.post('/contact', (req, res) => {
  const { custname, email, Concern, message} = req.body;

  // Validate form inputs
  if (!custname || !email || !Concern || !message ) {
    return res.status(400).send("<script>alert('Please fill all the required fields.'); window.history.back();</script>");
  }

  // Insert form data into the database
  const sql = `INSERT INTO contact_us (custname, email, Concern, message) VALUES (?, ?, ?, ?)`;
  db.query(sql, [custname, email, Concern, message], (err, result) => {
    if (err) {
      console.error('Error inserting data into the database:', err);
      return res.status(500).send("<script>alert('Database error.'); window.history.back();</script>");
    }

    res.send("<script>alert('Form submitted successfully!'); window.location.href='/';</script>");
  });
});

// Serve static files (e.g., HTML form)
app.use(express.static(path.join(__dirname, 'public')));

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });


// // ----------------------contact us form ends----------------------------

// // -------------------------checkout form and invoice--------------------------

const PDFDocument = require('pdfkit');
const fs= require('fs');

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Checkout route to handle form submission and generate PDF invoice
app.post('/checkout', (req, res) => {
  const { fullname, phone, address, area, pincode } = req.body;
  const products = [
    { name: 'Mehendi Service', price: 25000 , quantity: 2 }
  ];
  const totalQuantity = 2;
  const totalPrice = 50000;

  // Validate form inputs
  if (!fullname || !phone || !address || !area || !pincode) {
    return res.status(400).send("<script>alert('Please fill all the required fields.'); window.location.href='/checkout';</script>");
  }

  // Insert checkout data into the database
  const checkoutSql = `INSERT INTO checkout (fullname, phone, address, area, pincode) VALUES (?, ?, ?, ?, ?)`;
  db.query(checkoutSql, [fullname, phone, address, area, pincode], (err, result) => {
    if (err) {
      console.error('Error inserting checkout data:', err);
      return res.status(500).send("<script>alert('Database error.'); window.location.href='/checkout';</script>");
    }

    const checkoutId = result.insertId;

    // Insert product details
    const productSql = `INSERT INTO products (checkout_id, product_name, product_price, quantity) VALUES (?, ?, ?, ?)`;
    products.forEach(product => {
      db.query(productSql, [checkoutId, product.name, product.price, product.quantity], (err) => {
        if (err) {
          console.error('Error inserting product data:', err);
          return res.status(500).send("<script>alert('Database error.'); window.location.href='/checkout';</script>");
        }
      });
    });

    // Generate a PDF invoice
    const invoicePath = path.join(__dirname, `invoice_${checkoutId}.pdf`);
    const doc = new PDFDocument();
    const pdfStream = fs.createWriteStream(invoicePath);
    doc.pipe(pdfStream);

    // Add content to the PDF
    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`Full Name: ${fullname}`);
    doc.text(`Phone: ${phone}`);
    doc.text(`Address: ${address}`);
    doc.text(`Area: ${area}`);
    doc.text(`Pincode: ${pincode}`);
    doc.moveDown();

    // Add product details
    doc.fontSize(16).text('Products:', { underline: true });
    products.forEach((product, index) => {
      doc.fontSize(14).text(`Product ${index + 1}:`);
      doc.text(`- Name: ${product.name}`);
      doc.text(`- Price: Rs.${product.price}`);
      doc.text(`- Quantity: ${product.quantity}`);
      doc.text(`- Total: Rs.${product.price * product.quantity}`);
      doc.moveDown();
    });

    // Add total summary
    doc.fontSize(16).text('Summary:', { underline: true });
    doc.fontSize(14).text(`Total Quantity: ${totalQuantity}`);
    doc.text(`Total Price: Rs.${totalPrice}`);

    doc.end();

    // Wait for the PDF to be written to disk
    pdfStream.on('finish', () => {
      res.send(`<script>alert('Checkout successful! PDF invoice generated.'); window.location.href='/download-invoice/${checkoutId}';</script>`);

    });
  });
});

// Route to download the generated PDF invoice
app.get('/download-invoice/:id', (req, res) => {
  const invoiceId = req.params.id;
  const invoicePath = path.join(__dirname, `invoice_${invoiceId}.pdf`);

  // Check if the file exists
  if (fs.existsSync(invoicePath)) {
    res.download(invoicePath, `invoice_${invoiceId}.pdf`);
  } else {
    res.status(404).send("<script>alert('Invoice not found.'); window.location.href='/checkout';</script>");
  }
});

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

// // // -----------------------------checkout and invoice code ends-------------------