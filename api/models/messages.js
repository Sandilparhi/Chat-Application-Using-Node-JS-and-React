const mongoose = require('mongoose');

const messageSchema = mongoose.Schema({

    room: {
        type: String
       },
    message: {
        type: String,
        required: true
    },
    sender: {
        type: String,
        required: true
    },
    status: {
        type: Boolean
    },
    time: {},
    date:{}

});

module.exports = mongoose.model('Message', messageSchema);