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
const i18n = require("i18n");

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

// =============================================================================
// 404 AND ERRORS  =============================================================
// =============================================================================

app.get('/404', function(req, res, next){
	// trigger a 404 since no other middleware
	// will match /404 after this one, and we're not
	// responding here
	next();
});

app.get('/403', function(req, res, next){
	// trigger a 403 error
	var err = new Error(i18n.__('Not allowed!'));
	err.status = 403;
	next(err);
});

app.get('/500', function(req, res, next){
	// trigger a generic (500) error
	next(new Error(i18n.__('Keyboard cat!') ));
});

// Error handlers

// Since this is the last non-error-handling middleware use()d, we assume 404, as nothing else responded.

app.use(function(req, res, next){
	res.status(404);
	res.format({
		html: () => {
			const msg = i18n.__('Error 404 - Cannot find page');
			res.render('index', {
				title: title + i18n.__('Error Page'),
				headerTitle: i18n.__('Error'),
				icon:'',
				content: 'contents/error',
				message: `${msg} : ${req.url}`
			});
		},
			//  res.render('error', { message: `Error 404 - Cannot find page : ${req.url}`}); },
		json:  () => { res.json({ error: i18n.__('Not found') }); },
		default:  () => { res.type('txt').send(i18n.__('Not found')); }
	});
});

// error-handling middleware, take the same form as regular middleware, however they require an arity of 4, aka the signature (err, req, res, next).
// when connect has an error, it will invoke ONLY error-handling middleware.

// If we were to next() here any remaining non-error-handling middleware would then be executed, or if we next(err) to continue passing the error, only error-handling middleware
// would remain being executed, however here we simply respond with an error page.

app.use(function(err, req, res, next){
	// we may use properties of the error object here and next(err) appropriately, or if we possibly recovered from the error, simply next().
	res.status(err.status || 500);
	// res.render('error', { message: `Error ${err.status} : ${err}`});
	res.render('index', {
		title: title +  i18n.__('Error Page'),
		headerTitle: i18n.__('Error'),
		icon:'',
		content: 'contents/error',
		message: `Error ${err.status} : ${err}`
	});
});



// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
