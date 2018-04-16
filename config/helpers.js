const {SHA256} = require('crypto-js');
const mongoose = require('mongoose');
require('../models/transactions');
require('../models/player_logs');
const Player_Log = mongoose.model('player_logs');
const Transaction = mongoose.model('transaction');
const xml2js = require('xml2js');
var builder = new xml2js.Builder();


module.exports = {
    // send back xml reply
send_reply: (json, res,token) => {
    
    var xml_reply = builder.buildObject(json);

     res.send(xml_reply)
},
 
//resursion function to insert defence code in db
save_def_code:function(collection,callback){
    var dc = gen_rand_code();
    collection.createIndex({"def_code": 1},{unique: true})    
    collection.insertOne({"def_code": dc}, function(err, result){
        if ( err ){
        
         this.save_def_code(collection)
         console.log ('Defence code has dublicate: %s',err); //info about what went wrong
          } 
        if (result){
         //console.log ( result.ops[0].def_code );
         callback(result.ops[0].def_code)
        } 
    })
},

//save transfer id to db 
save_transfer_id:(collection,callback) =>{
    var id = gen_rand_code();
    collection.createIndex({"transfer_id": 1},{unique: true})    
    collection.insertOne({"transfer_id": id}, function(err, result){
        if ( err ){
            save_transfer_id(collection)
            console.log ('Transfer ID has dublicate: %s',err); //info about what went wrong
          } 
        if (result){
         //console.log ( result.ops[0].def_code );
         callback(result.ops[0].transfer_id)
        } 
    })
},

//save successful transactions into db
save_player_req:(model,id,request) =>{
    model.findById(id)
    .then((user) => {
        user.requests.push(request)
        Promise.all([user.save(),request.save()]).then(() =>{
            console.log('user and request saved ?')
        }).catch((err) => {
            console.log('ooops something went wrong: %s',err)
        })
    })
    .catch((err) => {
        console.log(err)
    })
},

//save empty transaction into db
save_empty_req:(op,err_code,msg,amount,transfer_id,user) =>{
    var transaction = new Transaction({op,err_code,transfer_id,amount,msg,user})
    transaction.save().then(() => {
           console.log('transaction saved, babyyy')
    }).catch((err) => {
        console.log(err)
    })
},

//save player logs
save_player_logs:(op,player_name,player_balance,player_pass,player_id) =>{
    var log = new Player_Log({
        op,
        player_name,
        player_balance,
        player_pass,
        player_id
    })
    log.save().then(() => {
        console.log('Player log saved')
    }).catch((err) => {
        console.log(err)
    })
},


//get user with certain player_id
get_user:(collection,op,cb) =>{
    var found_user_id,
        found_user_name

    collection.find().forEach(function(user){
      //  console.log(user.player_id)
        if(user.player_id == op.PlayerId[0]){
            found_user_id = user;
            }
        if(user.screenname == op.UserName[0] && user.password == op.Password[0]){
            found_user_name = user
        }
            //here item is record. ie. what you have to do with each record.
           
        }, function(err){
            if(err){
                console.log(err)
            }
            cb(found_user_id,found_user_name)
        })
},

//make a bet 
user_bet: (collection, id,transfer_id, bet,balance,res,op,cb) =>{

    collection.update({"player_id": id}, {$set:{"balance": balance - bet}}, function(err, result){
        if (err) {
            console.log('Error updating object: ' + err);
        } else {
        
           var user_found = null;
          
           collection.find().forEach(function(user){
               //  console.log(user.player_id)
               if(user.player_id == op.PlayerId[0]){
                  user_found = user
                         
              } 
          }, function(err) {
              
             // console.log('' + result + ' document(s) updated');
              var reply =  {
                'WithdrawResponse': {
                    'Balance': user_found.balance,
                    'ErrorCode': 1000,
                    'CasinoTransferId': transfer_id,
                    'ErrorMessage': 'OK',
                    'TotalBet': bet,
                    'TotalWin': 400,
                    'PlayTime': 2,
                }
            };
              cb(reply,res) 
          })
        }
    });
  },

//make a deposit
  user_deposit:(collection, id,transfer_id, deposit,balance,res,op,op_type,cb) =>{
    
    collection.update({"player_id": id}, {$set:{"balance": balance + deposit}}, function(err, result){
        if (err) {
            console.log('Error updating object: ' + err);
        } else {
        
           var user_found = null;
          
           collection.find().forEach(function(user){
               //  console.log(user.player_id)
               if(user.player_id == op.PlayerId[0]){
                  user_found = user
                         
              } 
          }, function(err) {
              var reply;
             console.log('' + result + ' document(s) updated');
            if(op_type == 'dr'){
                   reply =  {
                   'DepositResponse': {
                       'Balance': user_found.balance,
                       'ErrorCode': 1000,
                       'CasinoTransferId': transfer_id,
                       'ErrorMessage': 'OK',
                       'TotalDeposit': deposit,
                       'TotalWin': 400,
                       'PlayTime': 2,
                   }
               };       
            }else if(op_type == 'rr'){
                reply =  {
                    'RefundResponse': {
                        'Balance': user_found.balance,
                        'ErrorCode': 1000,
                        'CasinoTransferId': transfer_id,
                        'ErrorMessage': 'OK',
                        'TotalDeposit': deposit,
                        'TotalWin': 400,
                        'PlayTime': 2,
                    }
                };   
             }
              cb(reply,res) 
          })
        }
    });
  },

  //withdraw and deposit
  withdraw_deposit:(collection, id,transfer_id, deposit,bet,balance,res,op,cb) =>{
      var a = deposit - bet;
      console.log(a)
    collection.update({"player_id": id}, {$set:{"balance": balance + (a)}}, function(err, result){
        if (err) {
            console.log('Error updating object: ' + err);
        } else {
        
           var user_found = null;
          
           collection.find().forEach(function(user){
               //  console.log(user.player_id)
               if(user.player_id == op.PlayerId[0]){
                  user_found = user
                         
              } 
          }, function(err) {
              
             // console.log('' + result + ' document(s) updated');
              var reply =  {
                'WithdrawAndDepositResponse': {
                    'Balance': user_found.balance,
                    'ErrorCode': 1000,
                    'CasinoTransferId': transfer_id,
                    'ErrorMessage': 'OK',
                    'TotalBet': bet,
                    'TotalDeposit': deposit,
                    'PlayTime': 2,
                }
            };
              cb(reply,res) 
          })
        }
    });
  },

}
 // generate unique defence
function gen_rand_code () {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    var hash = SHA256(text).toString()
  
    return hash;
  }