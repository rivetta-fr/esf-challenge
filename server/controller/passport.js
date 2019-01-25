//connection
//var connection = require('./../config/database-pg-local');
const bcrypt = require('bcrypt-nodejs');
// config/passport.js

// load all the things we need
const LocalStrategy   = require('passport-local').Strategy;
    //const FacebookStrategy = require('passport-facebook').Strategy;
// load the auth variables
    //const configAuth = require('./../config/auth'); // use this one for testing


// expose this function to our app using module.exports
module.exports = function(passport, cruddb, i18n  ) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.ac_id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        const parameters ={
            table: 'account' ,
            join: ' INNER JOIN role ON ro_id = ac_roleid',
            where:  ` ac_id = ${id}`,
            orderBy: '',
            limit : 1
        };
        cruddb.list(parameters)
            .then( (rows) => {
                done(null, rows[0]);
            }).catch((error) => {
                console.log(error);
                done(error);
            });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses email and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            const parameters ={
                table: 'account' ,
                where:  ` ac_email = '${email}'`,
                orderBy: '',
                limit : 1
            };
            cruddb.list(parameters)
                .then( (rows) => {
                    if (rows.length) {
                        return done(null, false, req.flash('errorMessage', i18n.__('That email is already taken.')));
                    } else {
                        // if there is no user with that username create the user
                        const dateb = new Date(req.body.dateborn);
                        let firstname = req.body.firstname;
                        let lastname  = req.body.lastname;
                        firstname = firstname.charAt(0).toUpperCase() + firstname.toLowerCase().substr(1);
                        lastname = lastname.charAt(0).toUpperCase() + lastname.toLowerCase().substr(1);
                        let newUser = {
                            ac_firstname: firstname ,
                            ac_lastname: lastname,
                            ac_dateborn: dateb.toISOString().split('T')[0],
                            ac_gender: req.body.gender,
                            ac_phone:req.body.phone,
                            ac_email: email.toLowerCase(),
                            ac_levelid: req.body.level,
                            ac_facebookemail: email.toLowerCase(),
                            ac_consent: req.body.consent,
                            ac_consentthird: req.body.consentthird,
                            ac_password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                        };
                        //console.log(newUser);
                        cruddb.create('account',newUser).then( (row) =>{
                            newUser.ac_id = row.id; //Last Id Insert
                            // new log  FOR RGPD
                            let consentTxt = consentThirdTxt = 'No';
                            if(newUser.ac_consent == 1){
                                consentTxt = 'Yes';
                            }
                            if(newUser.ac_consentthird == 1){
                                consentThirdTxt = 'Yes';
                            }
                            const logData ={
                                lo_activity: `New user ${newUser.ac_email} with consent ${consentTxt} for VRT and consent ${consentThirdTxt} for VRT Partners`,
                                lo_accountid: newUser.ac_id,
                                lo_iserror : 'false'
                            };

                            cruddb.create('log',logData);
                            //END NEW LOG
                            return done(null, newUser);
                        }).catch( (error) => {
                            console.log(error);
                            return done(error);
                        });
                    }
                }).catch((error) => {
                    console.log(error);
                    return done(error);
                });
       })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) { // callback with email and password from our form
           // console.log("SELECT * FROM account WHERE ac_email = ", [email])
            const emailLower = email.toLowerCase();
            const parameters ={
                table: 'account' ,
                where:  ` ac_email = '${emailLower}'`,
                orderBy: '',
                limit : 1
            };
            cruddb.list(parameters)
                .then( (rows) => {
                    if (rows[0].ac_password ) {
                        if (!bcrypt.compareSync(password, rows[0].ac_password)) {

                            return done(null, false, req.flash('errorMessage', i18n.__('Oops! Wrong password.'))); // create the loginMessage and save it to session as flashdata
                        }
                        // all is well, return successful user
                        return done(null, rows[0]);
                    } else {
                        console.log("Login: No user found.");
                        // req.flash is the way to set flashdata using connect-flash
                        return done(null, false, req.flash('errorMessage', i18n.__('No user found.')));
                    }
                }).catch((error) => {

                    console.log('error:' + error);
                    return done(error);
               });
        })
    );


    /****** MODIFICARE FACEBOOK PER MYSQL *****/
/*
  // =========================================================================
  // FACEBOOK ================================================================
  // =========================================================================
  var fbStrategy = configAuth.facebookAuth;
  fbStrategy.passReqToCallback = true;  // allows us to pass in the req from our route (lets us check if a user is logged in or not)
  passport.use(new FacebookStrategy(fbStrategy,
  function(req, token, refreshToken, profile, done) {

      // asynchronous
      process.nextTick(function() {

          // check if the user is already logged in
          if (!req.user) {

              User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                  if (err)
                      return done(err);

                  if (user) {

                      // if there is a user id already but no token (user was linked at one point and then removed)
                      if (!user.facebook.token) {
                          user.facebook.token = token;
                          user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                          user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                          user.save(function(err) {
                              if (err)
                                  return done(err);

                              return done(null, user);
                          });
                      }

                      return done(null, user); // user found, return that user
                  } else {
                      // if there is no user, create them
                      var newUser            = new User();

                      newUser.facebook.id    = profile.id;
                      newUser.facebook.token = token;
                      newUser.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                      newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();

                      newUser.save(function(err) {
                          if (err)
                              return done(err);

                          return done(null, newUser);
                      });
                  }
              });

          } else {
              // user already exists and is logged in, we have to link accounts
              var user            = req.user; // pull the user out of the session

              user.facebook.id    = profile.id;
              user.facebook.token = token;
              user.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
              user.facebook.email = (profile.emails[0].value || '').toLowerCase();

              user.save(function(err) {
                  if (err)
                      return done(err);

                  return done(null, user);
              });
          }
      });

  })); */
};
