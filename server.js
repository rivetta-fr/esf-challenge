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
const passport = require('passport');
const port     = process.env.PORT || 8081;
const favicon = require('serve-favicon');

// configuration ===============================================================
i18n.configure({
	locales:['fr', 'en'],
	directory: __dirname + '/locales',
	//define the default language
	defaultLocale: 'fr'
	 // sets a custom cookie name to parse locale settings from

	// cookie: 'vrti18n'
});
// i18n init parses req for language headers, cookies, etc.
app.use(i18n.init);
app.use(session({
	name:'VeryRoadTripESF',
	secret: 'VeryRoadTripESF',
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

const cruddb = require('./server/controller/crud-pg-heroku');
require('./server/controller/passport')(passport, cruddb, i18n); // pass passport for configuration
const password = require('./server/controller/password')(cruddb, i18n);



// routes ======================================================================

//app.use(express.static(__dirname + '/'));
app.use('/', express.static(path.join(__dirname, 'public')));

app.use(favicon(__dirname + '/public/images/favicon.ico')); // FAVICON
//app.use('/en', express.static(__dirname + '/'));
//app.use('/fr', express.static(__dirname + '/'));
app.use('/images', express.static('public/images'));
app.use('/js', express.static('public/js'));
app.use('/css', express.static('public/css'));
app.use('/leaflet', express.static('public/leaflet'));
app.use('/uploads', express.static('public/uploads'));
app.use('/manifest.json', (req, res) => res.sendFile(__dirname +'/public/manifest.json'));
app.use('/sw.js', (req, res) => res.sendFile(__dirname +'/public/js/sw/sw.js'));

require('./server/routes.js')(app, passport, password, cruddb, i18n); // load our routes and pass in our app and fully configured passport
// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
