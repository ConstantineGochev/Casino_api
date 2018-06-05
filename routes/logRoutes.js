const routes = require('../config/routes');
const {logPath, totalSystemBalancePath} = routes;
const mongoose = require('mongoose');
require('../models/player_logs');
require('../models/transactions')
const Player_Log = mongoose.model('player_logs');
const Transaction = mongoose.model('transaction');


//Logs for user operations 
module.exports = (app) => {
    app.get(logPath, (req, res) => {
    //     var page_num = parseInt(req.query.page_num),
    //     size = parseInt(req.query.size),
    //     query = {},
    //     response
    // if(page_num < 0 || page_num === 0){
    //        response = {"error": true, "msg": "invalid page number shoud start at 1?!"}
    //        return res.json(response);
    // }
    // query.skip = size * (page_num - 1);
    // query.limit = size;
    Player_Log.count({},function(err, count){
        // if(err){
        //     console.log(err)
        // }
        Player_Log.find(/*{},{},query*/).then((logs) => {
            // if(err) {
            //     response = {"error":true, "msg": "Error fetching data"}
            // }
            var total_logs = Math.ceil(count);
            response = {"error": false, "data":logs, "total_logs":total_logs}
            res.json(response)
        }).catch((err) => {
            console.log(err)
        })
    })
 })


 app.get(totalSystemBalancePath, (req, res) => {
  
     var total_balance = 0;
     const transactions = Transaction.find({msg: "OK",op:{$nin: ["Authenticate", "GetPlayerBalance"]}})
     .then((transactions)=>{
             for(i=0; i< transactions.length; i++){
                 console.log(transactions[i].amount)
                 if(transactions[i].amount === undefined || transactions[i].amount === null ||transactions[i].amount ===NaN)return
                 total_balance += transactions[i].amount
             }
             console.log(total_balance)
        
         }).then(()=>{
              
             res.send({"total_balance":total_balance})
         })
         


 })

}