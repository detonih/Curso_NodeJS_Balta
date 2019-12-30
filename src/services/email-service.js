'use stricts';

const config = require('../config');
const sendgrid = require('sendgrid')(config.sendgridkey);

exports.send = async(to, subject, body) => {
    sendgrid.send({
        to: to,
        from: 'detonihenrique@gmail.com',
        subject: subject,
        html: body
    });
}