const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.some((user) => user.name === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const user = users.find((u) => {
    return u.name === username
  })

  if(!user) {
    return false
  }

  if(user.password === password) {
    return true
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username
  const password = req.body.password

  const isAuthenticated = authenticatedUser(username, password)

  if (!isAuthenticated) {
    return res.status(422).json({
        message: "Wrong username or password"
    })
  }

  const newToken = jwt.sign({
    username,
    loginTime: Date()
  }, process.env.JWT_SECRET || "access")

  req.session.authorization = {
    accessToken: newToken,
    username
  }

  return res.json({
    message: "Login successful!",
    token: newToken
  })
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.user?.username || req.session?.authorization?.username;

  if (!isbn || !review) {
    return res.status(400).json({
      message: "ISBN and review are required"
    });
  }

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  if (!username) {
    return res.status(403).json({
      message: "User not logged in"
    });
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added or updated successfully",
    reviews: books[isbn].reviews
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user?.username || req.session?.authorization?.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  delete books[isbn].reviews[username];

  return res.json({
    message: "Review deleted successfully",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
