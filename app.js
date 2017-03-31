var express = require("express");
var path = require("path");
var http = require("http");
var ejs = require("ejs");
var publicPath = path.resolve(__dirname, "public");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var userUploadsPath = path.resolve(__dirname, "user_uploads");
var publicPath = path.join(__dirname, 'public');
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://mohabamroo:ghostrider1@ds127260.mlab.com:27260/communitydb');
// mongoose.connect('mongodb://localhost/communitydb');
var db = mongoose.connection;
var mailer = require('express-mailer');
var app = express();

module.exports = app;

var routes = require('./routes/index');
var users = require('./routes/users');
var clubs = require('./routes/clubs');
var events = require('./routes/events');


app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs"); 
app.engine("html", ejs.renderFile);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(publicPath));
app.use(express.static(userUploadsPath));

// sessions
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));


app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  res.locals.pagetitle = 'Home Page';
  next();
});
 

app.use('/', routes);
app.use('/users', users);
app.use('/clubs', clubs);
app.use('/events', events);
app.listen(process.env.PORT||3000, function() {

	console.log("Express app started on port 3000.");
});
console.log('before export')
console.log('after export')
