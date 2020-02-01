var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var mongoose = require('mongoose');
const database = require('./db/config/database');
const http = require('http');

var users = require('./routes/users');

// Init App
var app = express();


// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, '../otsui/dist')));

app.use(express.static(path.join(__dirname, '../otsui/src/app')));

// Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());


// Connect Flash
app.use(flash());


app.use('/users', users);

// Initialize connection once
mongoose.connect(database.openUri, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true }).then(() => {
  console.log("Connected to Database");
  db = database;
  // Start the application after the database connection is ready
  /**
   * Get port from environment and store in Express.
   */
  const port = process.env.PORT || '2222';
  app.set('port', port);

  /**
   * Create HTTP server.
   */
  const server = http.createServer(app);

  /**
   * Listen on provided port, on all network interfaces.
   */
  server.listen(port, () => console.log(`API running on localhost:${port}`));
}).catch((err) => {
  console.log("Not Connected to Database ERROR! ", err);
});

