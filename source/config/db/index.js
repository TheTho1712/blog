const mongoose = require('mongoose');

async function connect() {
    try {
        mongoose.connect('mongodb://127.0.0.1:27017/thetho_dishes');
        console.log('Connect successfully');
    } catch (error) {
        console.log('fail to connect');
    }
}

module.exports = { connect };
