// app/routes.js
module.exports = function(app, passport, password, cruddb, i18n) {

    let title = 'Very Road Trip - ESF Challenge - ';
   	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
        // if user is authenticated in the session, carry on
        let parameters = {
            user:  {}
        };
        // if user is authenticated in the session, carry on

        if (req.isAuthenticated()){
            res.redirect('/account/modify');
        } else {
            res.redirect('/login');
        }
        /*
        if (req.isAuthenticated()){
            if(req.user){
                parameters.user = req.user // get the user out of session and pass to template
            }
        }

        */
    });

    app.post('/', function(req, res) {
        let parameters = {
            departure:  {"latitude":6.181377,"longitude": 48.690117},
            arrival:  {"latitude":6.443933, "longitude": 48.181589},
            waypoints: {}
        };
        if (req.body.departure && req.body.arrival ) {
            parameters = {
                departure: req.body.departure,
                arrival: req.body.arrival
            }
            if(req.body.waypoints){
                parameters['waypoints'] = req.body.waypoints;
            }
        }
        res.render('index', parameters );
    });


/*
   	// process the login form
	app.post('/newitinerary', function(req, res) {
            if (req.body.start && req.body.end ) {
                //calculate itinerari API roads
                req.flash('errorMessage', 'calculate itinerari API roads!');
            } else {
                req.flash('errorMessage', 'Please insert departure and arrival!');
            }
        res.redirect('/');
    });


    */

    // =====================================
	// LOGIN ===============================
	// =====================================
    // show the login form

    /*
    app.get('/login', function(req, res) {
        // if user is authenticated in the session, carry on
        res.send('Work in progress...stay tuned! ʘ‿ʘ');
    });
    */

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {
        // render the page and pass in any flash data if it exists
       let parameters = {
            title: title + i18n.__('Login Page'),
            headerTitle: i18n.__('Login'),
            icon:'sign-in',
            content: 'contents/account/login'
        }
        const errMsgRec = req.flash('errorMessage');
        if( errMsgRec != "" ){
            parameters.messagetype = "alert-danger";
            parameters.message = errMsgRec;
        }
        const sucMsgRec = req.flash('successMessage');
        if( sucMsgRec != "" ){
            parameters.messagetype = "alert-success";
            parameters.message = sucMsgRec;
        }
        res.render('index', parameters);
    });

    // process the login form
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("User Connected");
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });

    // =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        cruddb.list({table:"level"}).then( (levels) =>  {
            let parameters = {
                title: title + i18n.__('Signup'),
                headerTitle:i18n.__('Signup'),
                icon:'sign-in',
                content: 'contents/account/signup',
                levels: levels,
                messagetype: "",
                message: ""
            }
            const errMsgRec = req.flash('errorMessage');
            if( errMsgRec != "" ){
                parameters.messagetype = "alert-danger";
                parameters.message = errMsgRec;
            }
            const sucMsgRec = req.flash('successMessage');
            if( sucMsgRec != "" ){
                parameters.messagetype = "alert-success";
                parameters.message = sucMsgRec;
            }
            res.render('index', parameters );
        }).catch((err)=>{
            console.log(err);
            req.flash('errorMessage', err);
            res.redirect('/login');
        });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/', // redirect to the secure role section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

    // =====================================
	// Modify account ======================
	// =====================================

    app.get('/account/modify',isLoggedIn, (req,res) =>{
        const target = i18n.__("Modify account");
        let parameters ={
            title: title + target ,
            headerTitle: target,
            content: 'contents/account/modify-account',
            user: req.user
        };
        const errMsgRec = req.flash('errorMessage');
        if( errMsgRec != "" ){
            parameters.messagetype = "alert-danger";
            parameters.message = errMsgRec;
        }
        const sucMsgRec = req.flash('successMessage');
        if( sucMsgRec != "" ){
            parameters.messagetype = "alert-success";
            parameters.message = sucMsgRec;
        }
        res.render('index', parameters);
    });

    app.post('/account/modify', isLoggedIn, function(req, res) {
        const email = req.body.email.toLowerCase();
        const parameters ={
            table: 'account' ,
            where:  ` ac_email = '${email}' AND ac_id <> ${req.body.accountid}`,
            orderBy: '',
            limit : 1
        };
        cruddb.list(parameters).then( (rows) => {
            if (rows.length) {
                req.flash('errorMessage', i18n.__('That email is already taken.'));
                res.redirect('/account/modify');
            } else {
                // if there is no user with that username create the user
                const dateb = new Date(req.body.dateborn);
                let firstname = req.body.firstname;
                let lastname  = req.body.lastname;
                firstname = firstname.charAt(0).toUpperCase() + firstname.toLowerCase().substr(1);
                lastname = lastname.charAt(0).toUpperCase() + lastname.toLowerCase().substr(1);
                let updateUser = {
                    ac_firstname: firstname ,
                    ac_lastname: lastname,
                    ac_dateborn: dateb.toISOString().split('T')[0],
                    ac_gender: req.body.gender,
                    ac_phone:req.body.phone,
                    ac_email: email,
                    ac_levelid: req.body.level,
                    ac_facebookemail: email,
                    ac_consent: req.body.consent,
                    ac_consentthird: req.body.consentthird
                };
                if(typeof req.body.password != "undefined" && req.body.password != ""){
                    updateUser.ac_password = bcrypt.hashSync(req.body.password, null, null)  // use the generateHash function in our user model
                }
                const parameters ={
                    table: 'account' ,
                    condition:  `ac_email = '${email}'`,
                    fieldsValues: updateUser
                };
                cruddb.update(parameters).then( (row) =>{
                    // new log  FOR RGPD
                    let consentTxt = consentThirdTxt = 'No';
                    if(updateUser.ac_consent == 1){
                        consentTxt = 'Yes';
                    }
                    if(updateUser.ac_consentthird == 1){
                        consentThirdTxt = 'Yes';
                    }
                    const logData ={
                        lo_activity: `Update user ${email} with consent ${consentTxt} for VRT and consent ${consentThirdTxt} for VRT-Partners`,
                        lo_accountid: req.body.accountid,
                        lo_iserror : 'false'
                    };

                    cruddb.create('log',logData);
                    //END NEW LOG

                    req.flash('successMessage', i18n.__('Account updated correctly.') );
                    res.redirect(action);
                }).catch( (error) => {
                    console.log(error);
                    req.flash('errorMessage', error);
                    res.redirect(action);
                });
            }
        });
    });


     // =====================================
	// LIST SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit we will use route middleware to verify this (the isLoggedIn function)

    app.get('/:table/list', (req,res) =>{

        let parameters = {};
        //let condition; //, innerJoin;
        const user = req.user;
        switch(req.params.table){
            case 'itinerary':
                parameters ={
                    table: 'itinerary',
                    where: `it_accountid = ${user.ac_id}` // show all on period month-1 and month+1
                };
                break;
            case 'poi':
                let boundsobj = {
                    "south": req.query.south,
                    "west": req.query.west,
                    "north": req.query.north,
                    "east":  req.query.east
                };
                let typecond = ` AND ( (po_type=1 AND CURRENT_DATE > po_startdate::timestamp::date) OR po_startdate is null) `;
                switch (req.query.type){
                    case "poi":
                        typecond = 'AND po_type=1 AND CURRENT_DATE < po_startdate::timestamp::date';
                        break;
                    case "act":
                        typecond = 'AND po_type=2 AND CURRENT_DATE = po_startdate::timestamp::date OR po_startdate is null';
                        break;
                }
                parameters ={
                    table: 'poi',
                    where: ` St_Within(po_geom,ST_GeomFromText('POLYGON((${boundsobj.west} ${boundsobj.north}, ${boundsobj.east} ${boundsobj.north},${boundsobj.east} ${boundsobj.south},${boundsobj.west} ${boundsobj.south},${boundsobj.west} ${boundsobj.north}))',4326)) ${typecond}`, // show all on period month-1 and month+1
                    limit : 15
                };
                break;

                /*
            case 'course':
                condition= innerJoin = "";
                parameters ={
                    table: 'course' ,
                    join: innerJoin,
                    where: condition,
                    orderBy: 'co_name'
                };
                break;

            case 'account':
                parameters ={
                    table: 'account' ,
                    join: innerJoin,
                    where:  ` ac_roleid <> 0 AND ac_roleid <> 1`, // get only instructors and customers
                    orderBy: ' ac_roleid ASC, ac_firstname ASC ',
                    sort: ' '
                };
                break;


                */
        }

        cruddb.list(parameters).then( (results) =>  {
            res.json(results);
        }).catch((err)=>{
            const msg = `No data: ${err}`;
            console.log(msg);
            res.json({ error: msg });
        });
    });

    //search customer for add to schedule (see modal.js)
    /*
    app.post('/customers/list', isLoggedIn, (req,res) =>{
        if(req.user.ac_roleid < 2 && req.user.ac_roleid >= 0) {
            let condition, innerJoin;
            const parameters ={
                table: 'account' ,
                join: '',
                where: ` ac_roleid = 3 and (ac_firstname like '${req.body.query}%' or ac_lastname like '${req.body.query}%') `,
                orderBy: 'ac_lastname'
            };
            cruddb.list(parameters).then( (results) =>  {
                res.json(results);
            }).catch((err)=>{
                const msg = `No data: ${err}`;
                console.log(msg);
                res.json({ error: msg });
            });
        } else{
            res.redirect('/');
        }
    });
*/
    // function for PIDR study
    app.post('/poitest/list', (req,res) =>{
        let orderBy ='po_label';
        condition = "";
        limit = "";
        if(typeof req.body.order != 'undefined' && req.body.order != "" && req.body.order.length > 0 ){
            orderBy = req.body.order;
        }
        if( typeof req.body.condition != 'undefined' && req.body.condition != "" && req.body.condition.length > 0 ){
            condition =  req.body.condition;
        } else {
            limit = 10;
        }

        parameters ={
            table: 'poi',
            where: condition,
            orderBy: orderBy,
            limit : limit
        };
        console.log(parameters);
        cruddb.list(parameters).then( (results) =>  {
            res.header('Access-Control-Allow-Origin', '*');
            res.json(results);
        }).catch((err)=>{
            const msg = `No data: ${err}`;
            console.log(msg);
            res.json({ error: msg });
        });
    });
    //END PIDR

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
    });
    // =============================================================================
    // FORGOT PASSWORD =============================================================
    // =============================================================================
    app.get('/forgot', function(req, res) {
        res.render('index', {
            title: title + i18n.__('Forgot Page'),
            headerTitle: i18n.__('Forgot'),
            content: 'contents/account/forgot',
            messageType: "alert-danger",
            message: req.flash('errorMessage')
       });
    });

    app.post('/forgot', (req,res) =>{
        password.sendToken(req.body.email, req.headers.host).then( (msg) =>{
            req.flash('successMessage', msg);
            res.redirect('/');
        }).catch((err)=>{
            req.flash('errorMessage', err);
            res.redirect('/forgot');
        });
    });

    app.get('/reset/:token', function(req, res) {
        password.checkToken(req.params.token).then((data) =>{
            if(typeof data.email != 'undefined'){
                res.render('index', {
                    title: title + i18n.__('Reset Page'),
                    headerTitle: i18n.__('Reset'),
                    icon:'sign-in',
                    content: 'contents/account/reset',
                    email:data.email,
                    token:data.token
               });
            } else {
                req.flash('errorMessage', i18n.__('Local token is invalid or has expired.'));
                res.redirect('/forgot');
            }

        }).catch((err)=>{
            req.flash('errorMessage', i18n.__('Local token is invalid or has expired.'));
            res.redirect('/forgot');
        });
    });

    app.post('/reset/:token', (req,res) =>{
        password.resetPassword(req.body.password, req.params.token, req.body.email).then( (msg) => {
                req.flash('successMessage', msg);
                res.redirect('/login');
            }
        ).catch((err)=>{
            //res.render('forgot.ejs',{message: err});
            req.flash('errorMessage', err);
            res.redirect('/forgot');
        });
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

};

// =============================================================================
// route middleware to make sure================================================
// =============================================================================

function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()){
        return next();
    }
    // if they aren't redirect them to the home page
    res.redirect('/');
}
