const mongoose = require('mongoose');
const db = require('./keys');

module.exports = (cb) =>{
    mongoose.connect(db.mongoURI, function (err,db) {
        if (err) {
          return console.dir(err);
        }
        console.log('connected to db')
        var UserCollection = db.collection('users'),
            DefCodeCollection = db.collection('def_codes'),
            TransactionIdCollection = db.collection('transaction_ids');

            return cb(UserCollection,DefCodeCollection,TransactionIdCollection);    
    });
}