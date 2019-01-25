const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'mailer.rivetta.fr@gmail.com', // change with kmg email
        pass: 'vrtesf88'
    }
});

module.exports = transporter;