const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const resolveWithAxios = async (data) => {
  const response = await axios.get('http://localhost/virtual', {
    adapter: async (config) => ({
      data,
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      request: {}
    })
  });

  return response.data;
};


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  if (isValid(username)) {
    return res.status(409).json({message: "Username already exists"});
  }

  users.push({name: username, password: password});
  return res.status(201).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  return res.json(await resolveWithAxios({...books}));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  if (!isbn) {
    return res.status(400).json({message: "ISBN parameter is required"});
  }

  const book = await resolveWithAxios(books[isbn]);
  if (book) {
    return res.json(book);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  if (!author) {
    return res.status(400).json({message: "Author parameter is required"});
  }

  const filteredBooks = await resolveWithAxios(Object.values(books).filter(book => book.author === author));
  if (filteredBooks.length > 0) {
    return res.json(filteredBooks);
  } else {
    return res.status(404).json({message: "No books found for the given author"});
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  if (!title) {
    return res.status(400).json({message: "Title parameter is required"});
  }

  const filteredBooks = await resolveWithAxios(Object.values(books).filter(book => book.title === title));
  if (filteredBooks.length > 0) {
    return res.json(filteredBooks);
  } else {
    return res.status(404).json({message: "No books found for the given title"});
  }
});

//  Get book review
public_users.get('/review/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  if (!isbn) {
    return res.status(400).json({message: "ISBN parameter is required"});
  }

  const book = await resolveWithAxios(books[isbn]);
  if (book) {
    return res.json(book.reviews);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
