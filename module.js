#!/usr/bin/env node

var http = require('http');
var mysql = require('mysql');
const fs = require('fs');
//var index = require('./index.html')

var con = mysql.createConnection({
  host: "localhost",
  port:"22",
  user: "webaccess",
  password: "amazingWeb",
  database:"paauctionsite"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  // con.query("", function (err, result) {
  //   if (err) throw err;
  //   console.log("Database created");
  // });
});

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  if (!(req.url == "/")) {
    res.write(req.url + " was requested, but does not exist.");
  } else {
    res.write("Welcome to the homepage.")
    
  }
  res.end();
}).listen(8080);