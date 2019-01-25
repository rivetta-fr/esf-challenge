const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'claudio.rivetta@gmail.com', // change with kmg email
        pass: 'Isabella2009'
    }
});

module.exports = transporter;