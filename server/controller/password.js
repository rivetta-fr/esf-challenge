//connection

const transporter = require('./../config/nodemailer'); // pass nodemailer for configuration
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');

module.exports = function(cruddb,i18n){
    let modulePassword = {};
    modulePassword.sendToken = function (email, host){ // called by post forgot page in route
        const emailLow = email.toLowerCase();    // verify low case for email
        const parameters ={
            table: 'account' ,
            where:  ` ac_email = '${emailLow}'`,
            orderBy: '',
            limit : 1
        };
        return cruddb.list(parameters).then( (rows) => {
            console.log(emailLow);
            if (rows.length) {
                console.log(rows);
                const token = crypto.randomBytes(16).toString('hex'); // random tokens
                const expires = new Date();
                expires.setHours(expires.getHours()+1); // now +1 hour
                const parametersToken ={
                    table: 'account' ,
                    condition:  `ac_email = '${emailLow}'`,
                    fieldsValues: {ac_localtoken: token , ac_expirestoken: expires.toISOString() }
                };
                console.log(parametersToken);
                // function (table,id, fieldsValues)
                return cruddb.update(parametersToken ).then( () => {
                    const msg = i18n.__('An email has been sent to you with further instructions.');
                    const mailOptions = {
                        to: emailLow,
                        from: 'claudio@rivetta.fr', // change with kmg email
                        subject: 'Very Road Trip ' + i18n.__(' Password Reset'),
                        text: i18n.__('You are receiving this because you (or someone else) have requested the reset of the password for your account.') + '\n\n' +
                        i18n.__('Please click on the following link, or paste this into your browser to complete the process:') + '\n\n' +
                        'http://' + host + '/reset/' + token + '\n\n' +
                        i18n.__('If you did not request this, please ignore this email and your password will remain unchanged.')+'\n'
                    };
                    transporter.sendMail(mailOptions, function(err) {
                        if(err){
                            const msg = i18n.__('An error occured sending mail, but password was changed!');
                            console.log(msg + err);
                        }
                    });
                    return msg;
                }).catch( (error) => {
                    const msg = i18n.__('Update error in sendToken: ') + error;
                    console.log(msg);
                    return msg;
                });
            } else{
                return "";
            }
        });
    }

    modulePassword.checkToken = function (token){ //called by get reset page in route
        const parameters ={
            table: 'account' ,
            //where:  ` ac_expirestoken > DATE_SUB(NOW(),INTERVAL 1 HOUR) AND ac_localtoken = '${token}'`,
            where:  ` ac_expirestoken > NOW() - INTERVAL '1 HOUR' AND ac_localtoken = '${token}'`,
            orderBy: 'ac_id',
            limit : 1
        };
        return cruddb.list(parameters).then( (rows) => {
            if (rows.length) {
                // all is well, return successful user
                return { email:rows[0].ac_email, token:token};
            } else {
                const msg = i18n.__(`No data with this token!`);
                console.log(msg);
                return msg;
            }
        }).catch((error) => {
                console.log(error);
                return done(error);
        });
    }

    modulePassword.resetPassword = function (password, token, email){ //called by post reset page in route
        const passwordcr =  bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
        const emailLow = email.toLowerCase();
        const parameters ={
            table: `account` ,
            condition: `ac_email = '${emailLow}' AND ac_localtoken= '${token}'`,
            fieldsValues: {ac_password :passwordcr, ac_localtoken: null, ac_expirestoken: null }
        };
        console.log(parameters);
        return cruddb.update(parameters ).then( () => {
            let msg = i18n.__("Password changed, please make login.");
            const mailOptions = {
                to: emailLow,
                from: 'claudio@rivetta.fr', // change with kmg email
                subject: 'Very Road Trip - ' + i18n.__("Password changed"),
                text: i18n.__('Hello,') +'\n\n' + i18n.__('This is a confirmation that the password for your account has just been changed.')+'\n'
            };
            transporter.sendMail(mailOptions, function(err) {
                if(err){
                    msg = i18n.__('An error occured sending mail, but password was changed!');
                    console.log(err);
                }
            });
            return msg;
        }).catch( (error) => {
            let msg = i18n.__(`Update error in reset password: ${error}`);
            console.log(msg);
            return msg;
        });
    }

    return modulePassword;
}
