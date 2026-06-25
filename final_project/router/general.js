const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const bookClient = axios.create({
  adapter: async (config) => {
    const requestUrl = new URL(config.url, 'http://bookshop.local');
    const pathParts = requestUrl.pathname.split('/').filter(Boolean);
    let data;
    let status = 200;

    if (pathParts.length === 0) {
      data = books;
    } else if (pathParts[0] === 'isbn') {
      data = books[pathParts[1]];
    } else if (pathParts[0] === 'author') {
      const author = decodeURIComponent(pathParts.slice(1).join('/'));
      data = Object.values(books).filter((book) => book.author === author);
    } else if (pathParts[0] === 'title') {
      const title = decodeURIComponent(pathParts.slice(1).join('/'));
      data = Object.values(books).filter((book) => book.title === title);
    } else {
      status = 404;
      data = {message: "Route not found"};
    }

    return {
      data,
      status,
      statusText: status === 200 ? 'OK' : 'Not Found',
      headers: {},
      config,
      request: {}
    };
  }
});

const getAllBooks = async () => {
  const response = await bookClient.get('/');
  return response.data;
};

const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    bookClient.get(`/isbn/${encodeURIComponent(isbn)}`)
      .then((response) => {
        if (response.data) {
          resolve(response.data);
        } else {
          reject(new Error("Book not found"));
        }
      })
      .catch(reject);
  });
};

const getBooksByAuthor = async (author) => {
  const response = await bookClient.get(`/author/${encodeURIComponent(author)}`);
  return response.data;
};

const getBooksByTitle = async (title) => {
  const response = await bookClient.get(`/title/${encodeURIComponent(title)}`);
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
  const bookList = await getAllBooks();
  return res.json(bookList);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!isbn) {
    return res.status(400).json({message: "ISBN parameter is required"});
  }

  getBookByISBN(isbn)
    .then((book) => res.json(book))
    .catch(() => res.status(404).json({message: "Book not found"}));
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author;
  if (!author) {
    return res.status(400).json({message: "Author parameter is required"});
  }

  const filteredBooks = await getBooksByAuthor(author);
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

  const filteredBooks = await getBooksByTitle(title);
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

  const book = books[isbn];
  if (book) {
    return res.json(book.reviews);
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
