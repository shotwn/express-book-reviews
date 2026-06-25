const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
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
  }, process.env.JWT_SECRET)

  return res.json({
    token: newToken
  })
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
