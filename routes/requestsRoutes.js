const keys = require('../config/keys');
const {requestsPath} = keys;
const mongoose = require('mongoose');
require('../models/user');
const Transaction = mongoose.model('transaction');


//Get all the transactions for each player
module.exports = (app) => {
    app.get(requestsPath, (req, res) => {
        // var page_num = parseInt(req.query.page_num),
        //     size = parseInt(req.query.size),
        //     query = {},
        //     response
        // if(page_num < 0 || page_num === 0){
        //        response = {"error": true, "msg": "invalid page number shoud start at 1?!"}
        //        return res.json(response);
        // }
        // query.skip = size * (page_num - 1);
        // query.limit = size;
        res.send('test')
        // Transaction.count({},function(err, count){
        //     if(err){
        //         console.log(err)
        //     }

        //     Transaction.find().populate('user').then((requests,err) => {
        //         if(err) {
        //             response = {"error":true, "msg": "Error fetching data"}
        //         }
        //         var total_transactions = Math.ceil(count);
        //         response = {"error": false, "data":requests, "total_transactions":total_transactions}
        //         res.json(response)
        //     }).catch((err) => {
        //         console.log(err)
        //     })
        // })
    });

}