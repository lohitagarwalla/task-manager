var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'yahoo',
    auth: {
        user: 'lohitagarwalla@yahoo.com',
        pass: process.env.EMAIL_PASSWORD   // email password is saved in config/dev.env as an ev=nvironment variable so that it is not exposed. (config folder is not uploaded to repository)
    }
});


const sendWelcomeMail = (email, name) => {
    var mailOptions = {
        from: 'lohitagarwalla@yahoo.com',
        to: email,
        subject: 'Thanks for joining us',
        text: `Hi ${name}, Welcome to our notes app.`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


module.exports = {
    sendWelcomeMail
}