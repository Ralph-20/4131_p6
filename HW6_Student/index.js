// YOU CAN USE THIS FILE AS REFERENCE FOR SERVER DEVELOPMENT

// include the express module
var express = require("express");

const path = require('path'); // core node.js module

// create an express application
var app = express();
const url = require('url');

// helps in extracting the body portion of an incoming request stream
// var bodyparser = require('body-parser');
const bodyParser = require('body-parser');

// fs module - provides an API for interacting with the file system
var fs = require("fs");

// helps in managing user sessions
var session = require('express-session');

// include the mysql module
var mysql = require("mysql");

// helpful for reading, compiling, rendering pug templates
const pug = require("pug");  

// Bcrypt library for comparing password hashes
const bcrypt = require('bcrypt');


// A  library that can help read uploaded file for bonus.
// var formidable = require('formidable')

//Load view engine
app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'pug');


// apply the body-parser middleware to all incoming requests
app.use(bodyParser());

// use express-session
// in mremory session is sufficient for this assignment
app.use(session({
  secret: "csci4131secretkey",
  saveUninitialized: true,
  resave: false
}
));

// Create connection to MySQL database
const connection = mysql.createConnection({
  host: 'cse-mysql-classes-01.cse.umn.edu',
  user: 'C4131DF23U79',
  password: '6291',
  database: 'C4131DF23U79',
  port: 3306
});


// Use body-parser middleware to parse JSON payloads
app.use(bodyParser.json());

// Connect to MySQL database
connection.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

// server listens on port 9007 for incoming connections
app.listen(9007, () => console.log('Listening on port 9007!'));


// function to return the welcome page
app.get('/',function(req, res) {
  res.render('welcome');
  //  res.sendFile(__dirname + '/client/welcome.html');
});

// function to return the welcome page
app.get('/login',function(req, res) {
  res.render('login');
  // res.sendFile(__dirname + '/client/login.html');
});


// Handle POST requests to '/sendLoginDetails'
app.post('/sendLoginDetails', (req, res) => {
  const { username, password } = req.body;


  // Query the database to see if the UserID_Name is found in the acc_name of the tbl_accounts
  const sql = `SELECT * FROM tbl_accounts WHERE acc_name='${username}'`;
  connection.query(sql, (err, rows) => {
    if (err) throw err;
    // Check if the number of rows returned by the query is >=1
    if (rows.length >= 1) {
      
      // Use bcrypt to compare the user-entered password with the hashed password in the database
      const passwordMatches = bcrypt.compareSync(password, rows[0].acc_password);
      req.session.value = 0;

      if (passwordMatches) {
        // Set the session variable (for example, req.session.user = UserID_Name)
        req.session.value = 1;
        // Respond to the fetch request with a flag indicating login was successful (for example, res.json({status:’success’})
        res.json({ status: 'success' });
      } else {
        // Respond to the fetch request sent by the login page with a “fail” flag (for example, res.json(({status:’fail’)})
        
        res.json({ status: 'fail' });

      }

    } else {
      // Respond to the fetch request sent by the login page with a “fail” flag (for example, res.json(({status:’fail’)})
      res.json({ status: 'fail' });
    }
  });
});


// Handle GET requests to '/schedule'
app.get('/schedule', (req, res) => {
  // Check if the session variable has been set to indicate the user is logged in
  if (req.session.value) {
    // res.sendFile(__dirname + '/client/schedule.html');
    res.render('schedule');
  } else {
    // res.sendFile(__dirname + '/client/login.html');
    console.log("Logged out!");
    res.render('login');
  }
});


// Handle GET requests to '/addEvent'
app.get('/addEvent', (req, res) => {
  // Check if the session variable has been set to indicate the user is logged in
  if (req.session.value) {
    // res.sendFile(__dirname + '/client/addEvent.html');
    res.render('addEvent');
  } else {
    // res.sendFile(__dirname + '/client/login.html');
    console.log("Logged out!");
    res.render('login');
  }
});


// Handle GET requests to '/home'
app.get('/home', (req, res) => {
  // Check if the session variable has been set to indicate the user is logged in
  if (req.session.value) {
    // res.sendFile(__dirname + '/client/index.html');
    res.render('index');
  } else {
    // res.sendFile(__dirname + '/client/login.html');
    console.log("Logged out!");
    res.render('login');
  }
});

// Handle Get request for '/logout'
app.get('/logout', (req, res) => {
  // Destroy the session to log the user out
  req.session.destroy(err => {
      if (err) {
          console.error(err);
          // res.sendFile(__dirname + '/client/login.html');
          res.render('login');
      } else {
        // res.sendFile(__dirname + '/client/login.html');
        console.log("Logged out!");
        res.render('login');
      }
  });
});



// handle POST request to add event
app.post("/postEventEntry", (req, res) => {
  const { day, event, start, end, location, phone, info, url } = req.body;
  const sql = `INSERT INTO tbl_events (event_day, event_event, event_start, event_end, event_location, event_phone, event_info, event_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [day, event, start, end, location, phone, info, url];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error adding event");
    } else {
      // res.sendFile(__dirname + '/client/schedule.html');
      res.render('schedule');
    }
  });
});



// am going to have to retrieve the schedule information from the MySql database (tbl_events) and return it in 
// a JSON object, intead of readin th eschedule information from a local JSONO file and returning it


// handle GET request for events based on day parameter
app.get('/event_details', (req, res) => {
  const day = req.query.day;
  // console.log("day is : " + day);
  const sql = `SELECT * FROM tbl_events WHERE event_day = '${day}'`;

  // console.log("Made it to the server side");

  connection.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error retrieving events");
    } else {
      var myObj = [];
      

      results.forEach(row => {
        var name = row.event_event;
        var day = row.event_day;
        var event = row.event_event;
        var start = row.event_start;
        var end = row.event_end;
        var location = row.event_location;
        var info = row.event_info;
        var url = row.event_url;
        var phone = row.event_phone;

        // storing a JSON object
        var jsonObj = {};
        jsonObj.name = name;
        jsonObj.day = day;
        jsonObj.event = event; 
        jsonObj.start = start;
        jsonObj.end = end;
        jsonObj.location = location;
        jsonObj.info = info;
        jsonObj.url = url;
        jsonObj.phone = phone;

        day = day.toLowerCase();

        myObj.push(jsonObj);

        // sorting the events by start time

        myObj.sort(function(a, b) {
          var timeA = a.start.split(":");
          var timeB = b.start.split(":");
          var hourA = timeA[0];
          var hourB = timeB[0];
          var minA = timeA[1];
          var minB = timeB[1];
          if (hourA == hourB) {
            return minA - minB;
          }
          return hourA - hourB;
        });

        // converting from military time to normal time

        for (var i = 0; i < myObj.length; i++) {
          var startTimeMil = myObj[i].start;
          var endTimeMil = myObj[i].end;
          var startTime = convertTime(startTimeMil);
          var endTime = convertTime(endTimeMil);


          myObj[i].start = startTime;
          myObj[i].end = endTime;
        }


      });

      res.send(myObj);
    }
  });
});


function convertTime(militaryTime) {
  let timeArray = militaryTime.split(":");
  let hour = parseInt(timeArray[0]);
  let minute = parseInt(timeArray[1]);

  let ampm = "AM";
  if (hour >= 12) {
    ampm = "PM";
    hour -= 12;
  }
  if (hour == 0) {
    hour = 12;
  }

  return hour + ":" + (minute < 10 ? "0" + minute : minute) + " " + ampm;
}

// middle ware to serve static files
app.use('/client', express.static(__dirname + '/client'));


// function to return the 404 message and error to client
app.get('*', function(req, res) {
  // add details
  res.sendStatus(404);
});



