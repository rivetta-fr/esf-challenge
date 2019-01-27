// server.js

// set up ======================================================================
// get all the tools we need
const express  = require('express');
const session  = require('express-session');
const i18n = require("i18n");
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const flash    = require('connect-flash');
const path = require('path');
const app      = express();
const port     = process.env.PORT || 8080;
const favicon = require('serve-favicon');



app.use(session({
	name:'VeryRoadTrip-ESF',
	secret: 'VeryRoadTrip',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(flash()); // use connect-flash for flash messages stored in session


// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)


app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());


app.set('view engine', 'ejs'); // set up ejs for templating


// routes ======================================================================

//app.use(express.static(__dirname + '/'));
app.use('/', express.static(path.join(__dirname, 'public')));

app.use(favicon(__dirname + '/public/images/favicon.ico')); // FAVICON
//app.use('/en', express.static(__dirname + '/'));
//app.use('/fr', express.static(__dirname + '/'));
app.use('/images', express.static('public/images'));
app.use('/js', express.static('public/js'));
app.use('/css', express.static('public/css'));
app.use('/manifest.json', (req, res) => res.sendFile(__dirname +'/public/manifest.json'));
app.use('/sw.js', (req, res) => res.sendFile(__dirname +'/public/js/sw/sw.js'));

 // load our routes and pass in our app and fully configured passport
 // =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
        // if user is authenticated in the session, carry on
        res.render('index');
    });

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
