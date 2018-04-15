'use strict'
 
 
const CLUSTER_CHILDREN = 1;
 
////////////////////////////
const https = require('https')
const fs = require('fs');
const express = require('express')
const bodyParser = require('body-parser')
const xmlparser = require('express-xml-bodyparser');
const express_json = require('express-json');
var cluster = require('cluster');
const mongoose = require('mongoose');
const morgan = require('morgan')
const session = require('express-session');
const {SHA256} = require('crypto-js');
const _ = require('lodash');
const webpack = require('webpack');
const webpackDevMiddleware =require('webpack-dev-middleware');
const webpack_config = require('./webpack.config');


//json web token ?
// const expressJWT = require('express-jwt');
// const jwt = require('jsonwebtoken');


const port = process.env.PORT || 3000;


const xml2js = require('xml2js');
var builder = new xml2js.Builder();
var parseString = require('xml2js').parseString;
var qs = require('querystring');
var ObjectID = require('mongodb').ObjectID;   


//load user model
require('./models/user');
require('./models/transactions');
require('./models/player_logs');
const Player_Log = mongoose.model('player_logs');
const Transaction = mongoose.model('transaction');
const User = mongoose.model('user');

 
// Create a new instance of express
var https_options = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem'),
};

 
 
if (cluster.isMaster) {
    // console.log("helo master");
    for (var i=0; i<CLUSTER_CHILDREN; i++) {
        cluster.fork();
    }
 
} else if (cluster.isWorker) {
 
    const app = express();

    //morgan middleware
    app.use(morgan('dev'));
    // Tell express to use the body-parser middleware and to not parse extended bodies
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(webpackDevMiddleware(webpack(webpack_config)))
    
    const ConnectToDB = require('./config/db-connect')
    
    ConnectToDB(function(UserCollection,DefCodeCollection,TransactionIdCollection){
        console.log('connect to db invoked')
        
        //expess session
        //must have setting to set expiration of the session FIX
        const dc_expiry_seconds = 6000000
        app.use(session({ secret: 'this-is-a-secret-token',
                          saveUninitialized: false,
                          resave:false,
                          cookie: { maxAge: dc_expiry_seconds }}));
        
        // Routes
        var path = '/new_path/apiv2/entry',
            players_path = '/new_path/apiv2/entry/players',
            req_path = '/new_path/apiv2/entry/requests',
            log_path = '/new_path/apiv2/entry/logs'
        //get request generates defence code 
        app.get(path, function(req, res){
           save_def_code(DefCodeCollection,(dc)=>{
               var session = req.session;
               session.dc = dc
               res.send(dc)
           })
           console.log('session id === %s',session.id)

        })
        //get all users 
        app.get(players_path, (req, res)=>{
            var page_num = parseInt(req.query.page_num),
            size = parseInt(req.query.size),
            query = {},
            response
            if(page_num < 0 || page_num === 0){
                response = {"error": true, "msg": "invalid page number shoud start at 1?!"}
                return res.json(response);
              }
              query.skip = size * (page_num - 1);
              query.limit = size;
            User.count({}, function(err, count){
            
                User.find({},{}, query).populate('requests').then((users) => {
                    if(err) {
                        response = {"error":true, "msg": "Error fetching data"}
                    }
                    var total_pages = Math.ceil(count / size);
                    response = {"error": false, "data":users, "pages":total_pages}
                    res.json(response)
                }).catch((err) => {
                    console.log(err)
                })
            })
          
        })
        //get all requests
        app.get(req_path, (req, res) => {
            var page_num = parseInt(req.query.page_num),
                size = parseInt(req.query.size),
                query = {},
                response
            if(page_num < 0 || page_num === 0){
                   response = {"error": true, "msg": "invalid page number shoud start at 1?!"}
                   return res.json(response);
            }
            query.skip = size * (page_num - 1);
            query.limit = size;

            Transaction.count({},function(err, count){

                Transaction.find({},{},query).populate('user').then((requests) => {
                    if(err) {
                        response = {"error":true, "msg": "Error fetching data"}
                    }
                    var total_pages = Math.ceil(count / size);
                    response = {"error": false, "data":requests, "pages":total_pages}
                    res.json(response)
                }).catch((err) => {
                    console.log(err)
                })
            })
        })

        //get all player logs
        app.get(log_path, (req, res) => {
            var page_num = parseInt(req.query.page_num),
            size = parseInt(req.query.size),
            query = {},
            response
        if(page_num < 0 || page_num === 0){
               response = {"error": true, "msg": "invalid page number shoud start at 1?!"}
               return res.json(response);
        }
        query.skip = size * (page_num - 1);
        query.limit = size;
        Player_Log.count({},function(err, count){

            Player_Log.find({},{},query).then((logs) => {
                if(err) {
                    response = {"error":true, "msg": "Error fetching data"}
                }
                var total_pages = Math.ceil(count / size);
                response = {"error": false, "data":logs, "pages":total_pages}
                res.json(response)
            }).catch((err) => {
                console.log(err)
            })
        })
     })

        //create a new user 
        app.post(players_path, (req,res) => {
            
            const new_user = new User({
                player_id: req.body.player_id,
                screenname:req.body.screenname,
                password: req.body.password,
                balance: req.body.balance,
                banned: req.body.banned
            });
                   new_user.save(function(err, user) {
                      // console.log(err)
                       if(err){
                           if(err.code === 11000){
                               return res.status(500).send({succes:false, msg:'User already exists'});
                           }
                               return res.status(500).send({succes: false, msg: 'Opss something went wrong with the database',err})
                       }
                       save_player_logs('Player created',user.screenname,user.balance,user.password,user.player_id)
                       res.json({succes: true, msg: 'User registered', user})
                   })
               
        })
        //edit a player
        app.put(players_path + '/:id', (req, res) => {
            User.findOne({_id: req.params.id})
            .then((user) => {
                user.player_id = req.body.player_id,
                user.screenname = req.body.screenname,
                user.password = req.body.password,
                user.balance = req.body.balance,
                user.banned = req.body.banned
                user.save()
                .then((user) => {
                    save_player_logs('Player credentials changed',user.screenname,user.balance,user.password,user.player_id)
                    res.send({msg: 'User updated', user})
                }).catch((err) => {
                    console.log(err)
                })
            }).catch((err) => {
                console.log(err)
            })
        })
        //delete a player
        app.delete(players_path + '/:id', (req, res) => {
            User.remove({_id:req.params.id})
            .then((user) => {
                save_player_logs('Player deleted',user.screenname,user.balance,user.password,user.player_id)
                res.send({msg: 'User deleted', user})

            }).catch((err) => {
                console.log(err);
            })
        })

        //post requests
        app.post(path,  (req, res) => {
      
                var body = '';
                var session_dc = req.session.dc
                
                req.on('data', function (data) {
                    body += data;
                    // Too much POST data, kill the connection! // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                    if (body.length > 1e6)
                    req.connection.destroy();
                });
                
                req.on('end',  () => {
                    var post = qs.parse(body);

                    try {
                    
                            var json = parseString(body,  (err, result) => {
                                if (err) {
                                    console.log("go err:", err);
                                    return;
                                }
                                //  console.log(result); // <<-
                                var key = Object.keys(result)[0];
                                //authenticate request        
                                if (undefined !== result['AuthRequest']) {
                                    console.log(key)
                            var ar = result['AuthRequest'];

                             console.log(ar.DefenceCode[0])
                             var req_dc = ar.DefenceCode[0]


                             //the session defence code
                             //console.log('this is the sesison dc  ==== %s', req.session.dc)
                                    var reply;
                             //console.log("================================================\n\n")
                             //console.log(req.session.cookie.maxAge)
                                 
                                    // done or error
                       
                         get_user(UserCollection,ar,(user_found_id, user_found_name) => {
                             
                            // console.log(user_found_id)
                            // console.log(user_found_name)            
                                        
                            if (null == user_found_id && null == user_found_name) {
                                // greshka
                                reply = {
                                   'AuthResponse': {
                                    'Balance': null,
                                    'ErrorCode': 3000,
                                    'ErrorMessage': 'User not found'
                                        }
                                   };
                               save_empty_req('Authenticate',3000,'User not found')
                                   
                                            // console.log(user_found)
                             }else if(user_found_name == null){
                                
                                reply = {
                                    'AuthResponse': {
                                    'Balance': null,
                                    'ErrorCode': 3102,
                                    'ErrorMessage': 'Wrong username or password'
                                    }
                                };
                              save_empty_req('Authenticate',3102,'Wrong username or password')
                         
                             } else if(user_found_id == null || user_found_id.player_id != user_found_name.player_id){
                                reply = {
                                    'AuthResponse': {
                                    'Balance': null,
                                    'ErrorCode': 3104,
                                    'ErrorMessage': 'Wrong player ID'
                                    }
                                };
                               save_empty_req('Authenticate',3104,'Wrong player ID')
                                
                             }else if(user_found_name.banned === true){
                                reply = {
                                    'AuthResponse': {
                                    'Balance': null,
                                    'ErrorCode': 3103,
                                    'ErrorMessage': 'Player is banned'
                                    }
                                };
                               save_empty_req('Authenticate',3103,'Player is banned')
                                
                             }else if(undefined === session_dc){
                                reply = {
                                    'AuthResponse': {
                                    'Balance': null,
                                    'ErrorCode': 3101,
                                    'ErrorMessage': 'Session has expired'
                                    }
                                };
                               save_empty_req('Authenticate',3101,'Session has expired')
                                
                             }   else if(req_dc != session_dc){
                                 reply = {
                                    'AuthResponse': {
                                    'Balance': null,
                                    'ErrorCode': 3100,
                                    'ErrorMessage': 'Wrong defence code'
                                    }
                                };
                               save_empty_req('Authenticate',3100,'Wrong defence code',null,null,user_found_name)
                                
                             }else {
                               
                                 reply = {
                                    'AuthResponse': {
                                    'Balance': user_found_name.balance,                                       'ErrorCode': 1000,
                                    'ErrorMessage': 'OK'
                                    }
                                };
                               // console.log(user_found)                            
                            const request = new Transaction({op: "Authenticate",err_code: '1000',msg:'OK',user:user_found_name._id})

                              save_player_req(User,user_found_name._id,request);
                                
                            }
                           send_reply(reply, res)

                        });                        
                

                        //var xml_reply = builder.buildObject(reply);
                        //res.send(xml_reply)
                     //withdraw request start
                    } else if (undefined !== result['WithdrawRequest']) {
                        console.log(result[0])
                        var wr = result['WithdrawRequest'];
                        var reply;
                        
                        // done or error
                get_user(UserCollection,wr,(user_found_id, user_found_name) => {
                            var amount = JSON.parse(wr.Amount[0]);
                            var reason = wr.Reason[0]
                            console.log('reason === %s', reason)                        
                            
                      if (null == user_found_id && null == user_found_name) {
                          // greshka
                          reply =  {
                            'WithdrawResponse': {
                                'Balance': null,
                                'ErrorCode': 3000,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'User not found',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                         save_empty_req('Withdraw',3000,'User not found',amount)
                         send_reply(reply,res)
                      }else if(user_found_name == null){
                        reply =  {
                            'WithdrawResponse': {
                                'Balance': null,
                                'ErrorCode': 3101,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Wrong player name or password',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_empty_req('Withdraw',3101,'Wrong player name or password',amount)         
                        send_reply(reply,res)

                      } else if(user_found_id == null || user_found_id.player_id != user_found_name.player_id){
                        reply =  {
                            'WithdrawResponse': {
                                'Balance': null,
                                'ErrorCode': 3104,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Wrong player ID',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_empty_req('Withdraw',3104,'Wrong player ID',amount)                                 
                        send_reply(reply,res)

                      }else if(user_found_name.balance < wr.Amount[0]){
                        reply =  {
                            'WithdrawResponse': {
                                'Balance': null,
                                'ErrorCode': 3103,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Insufficient balance',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_transfer_id(TransactionIdCollection, (t_id) => {
                            save_empty_req('Withdraw',3103,'Insufficient balance',amount,t_id,user_found_name)
                            send_reply(reply,res)

                        })

                      } else if(undefined === session_dc){
                          reply =  {
                            'WithdrawResponse': {
                                'Balance': null,
                                'ErrorCode': 3102,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Session has expired',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_empty_req('Withdraw',3101,'Session has expired',amount);                  
                        send_reply(reply,res)
                      }else if(reason != 'ROUND_BEGIN') {
                        reply =  {
                            'WithdrawResponse': {
                                'Balance': null,
                                'ErrorCode': 3105,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Invalid reason',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_transfer_id(TransactionIdCollection, (t_id) => {
                            save_empty_req('Withdraw',3105,'Invalid reason',amount,t_id,user_found_name);                  
                            send_reply(reply,res)

                        })
                      } else {
                        var {player_id,balance, requests,_id} = user_found_name;
                        
                        
                 save_transfer_id(TransactionIdCollection, (t_id) => {
                                                   
                            
                            const request = new Transaction({op: "Withdraw",err_code: '1000',transfer_id: t_id,amount:amount,msg:'OK',user:_id})
                            save_player_req(User,_id,request);
                            user_bet(UserCollection,player_id,t_id,amount,balance,res,wr,send_reply)
                        })
                    }    
                })
                
                    //deposit request start
                    } else if (undefined !== result['DepositRequest']) {
                        var dr = result['DepositRequest'];
                        //var session_dc = req.session.dc
                        var reply;
                        
              get_user(UserCollection,dr,(user_found_id, user_found_name) => {   
                            var amount = JSON.parse(dr.Amount[0]);
                            var reason = dr.Reason[0]                        
                      // done or error
                      if (null == user_found_id && null == user_found_name) {
                          // greshka
                          reply =  {
                            'DepositResponse': {
                                'Balance': null,
                                'ErrorCode': 3000,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'User not found',
                                'TotalDeposit': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                         save_empty_req('Deposit',3000,'User not found',amount);                                          
                         send_reply(reply,res)
                      }else if(user_found_name == null){
                        reply =  {
                            'DepositResponse': {
                                'Balance': null,
                                'ErrorCode': 3100,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Wrong username or password',
                                'TotalDeposit': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_empty_req('Deposit',3100,'Wrong username or password',amount);                                                                  
                        send_reply(reply,res)
                          

                      } else if(user_found_id == null || user_found_id.player_id != user_found_name.player_id){
                        reply =  {
                            'DepositResponse': {
                                'Balance': null,
                                'ErrorCode': 3102,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Wrong player ID',
                                'TotalDeposit': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_empty_req('Deposit',3102,'Wrong player ID',amount);                                                                                          
                        send_reply(reply,res)
                          

                      } else if(undefined === session_dc){
                        reply =  {
                          'DepositResponse': {
                              'Balance': null,
                              'ErrorCode': 3101,
                              'CasinoTransferId': null,
                              'ErrorMessage': 'Session has expired',
                              'TotalDeposit': null,
                              'TotalWin': null,
                              'PlayTime': null,
                          }
                      };
                      save_empty_req('Deposit',3101,'Session has expired',amount);                                                                          
                      send_reply(reply,res)
                    }else if(reason != 'ROUND_END'){
                        reply =  {
                            'DepositResponse': {
                                'Balance': null,
                                'ErrorCode': 3105,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Invalid reason',
                                'TotalDeposit': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_transfer_id(TransactionIdCollection, (t_id) => {

                            save_empty_req('Deposit',3105,'Invalid reason',amount,t_id,user_found_name);                                                                          
                            send_reply(reply,res)
                        })
                    } else {
                        var {player_id,balance,_id} = user_found_name

                        
                        save_transfer_id(TransactionIdCollection, (t_id) => {                     
                            
                            const request = new Transaction({op: "Deposit",err_code: '1000',transfer_id: t_id,amount:amount,msg:'OK',user:_id})

                            save_player_req(User,_id,request);
                            user_deposit(UserCollection,player_id,t_id,amount,balance,res,dr,'dr',send_reply)
                        })
                    }    
                })
 
                    } else if (undefined !== result['RefundRequest']) {
                    
                        console.log('in the refund request !!!!!+++')
                        var rr = result['RefundRequest'];
                        var code = 1000;
                        get_user(UserCollection,rr,(user_found_id, user_found_name) => {
                            var amount = JSON.parse(rr.Amount[0]);
                            var reason = rr.Reason[0]
                            console.log('reason === %s', reason)                        
                            
                      if (null == user_found_id && null == user_found_name) {
                          // greshka
                          reply =  {
                            'RefundResponse': {
                                'Balance': null,
                                'ErrorCode': 3000,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'User not found',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                         save_empty_req('Refund',3000,'User not found',amount)
                         send_reply(reply,res)
                      }else if(user_found_name == null){
                        reply =  {
                            'RefundResponse': {
                                'Balance': null,
                                'ErrorCode': 3101,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Wrong player name or password',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_empty_req('Refund',3101,'Wrong player name or password',amount)         
                        send_reply(reply,res)

                      } else if(user_found_id == null || user_found_id.player_id != user_found_name.player_id){
                        reply =  {
                            'RefundResponse': {
                                'Balance': null,
                                'ErrorCode': 3104,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Wrong player ID',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_empty_req('Refund',3104,'Wrong player ID',amount)                                 
                        send_reply(reply,res)

                      }else if(user_found_name.balance < rr.Amount[0]){
                        reply =  {
                            'RefundResponse': {
                                'Balance': null,
                                'ErrorCode': 3103,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Insufficient balance',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_transfer_id(TransactionIdCollection, (t_id) => {
                            save_empty_req('Refund',3103,'Insufficient balance',amount,t_id,user_found_name)
                            send_reply(reply,res)

                        })

                      } else if(undefined === session_dc){
                          reply =  {
                            'RefundResponse': {
                                'Balance': null,
                                'ErrorCode': 3102,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Session has expired',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_empty_req('Refund',3101,'Session has expired',amount);                  
                        send_reply(reply,res)
                      }else if(reason != 'ROUND_END') {
                        reply =  {
                            'RefundResponse': {
                                'Balance': null,
                                'ErrorCode': 3105,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Invalid reason',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_transfer_id(TransactionIdCollection, (t_id) => {
                            save_empty_req('Refund',3105,'Invalid reason',amount,t_id,user_found_name);                  
                            send_reply(reply,res)

                        })
                      } else {
                        var {player_id,balance, requests,_id} = user_found_name;
                        
                        
                 save_transfer_id(TransactionIdCollection, (t_id) => {
                                                   
                            
                            const request = new Transaction({op: "Refund",err_code: '1000',transfer_id: t_id,amount:amount,msg:'OK',user:_id})
                            save_player_req(User,_id,request);
                            user_deposit(UserCollection,player_id,t_id,amount,balance,res,rr,'rr',send_reply)                         
                        })
                    }    
                })
 
                    } else if (undefined !== result['WithdrawAndDepositRequest']) {
                        var wdr = result['WithdrawAndDepositRequest'];
                        var code = 1000;
                        get_user(UserCollection,wdr,(user_found_id, user_found_name) => {
                            var amount = JSON.parse(wdr.Amount[0]);
                            var bet = JSON.parse(wdr.WinAmount[0])
                            var reason = wdr.Reason[0]
                            console.log('reason === %s', reason)                        
                            
                      if (null == user_found_id && null == user_found_name) {
                          // greshka
                          reply =  {
                            'WithdrawAndDepositResponse': {
                                'Balance': null,
                                'ErrorCode': 3000,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'User not found',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                         save_empty_req('WithdrawAndDeposit',3000,'User not found',amount)
                         send_reply(reply,res)
                      }else if(user_found_name == null){
                        reply =  {
                            'WithdrawAndDepositResponse': {
                                'Balance': null,
                                'ErrorCode': 3101,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Wrong player name or password',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_empty_req('WithdrawAndDeposit',3101,'Wrong player name or password',amount)         
                        send_reply(reply,res)

                      } else if(user_found_id == null || user_found_id.player_id != user_found_name.player_id){
                        reply =  {
                            'WithdrawAndDepositResponse': {
                                'Balance': null,
                                'ErrorCode': 3104,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Wrong player ID',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_empty_req('WithdrawAndDeposit',3104,'Wrong player ID',amount)                                 
                        send_reply(reply,res)

                      }else if(user_found_name.balance < wdr.Amount[0]){
                        reply =  {
                            'WithdrawAndDepositResponse': {
                                'Balance': null,
                                'ErrorCode': 3103,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Insufficient balance',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_transfer_id(TransactionIdCollection, (t_id) => {
                            save_empty_req('WithdrawAndDeposit',3103,'Insufficient balance',amount,t_id,user_found_name)
                            send_reply(reply,res)

                        })

                      } else if(undefined === session_dc){
                          reply =  {
                            'WithdrawAndDepositResponse': {
                                'Balance': null,
                                'ErrorCode': 3102,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Session has expired',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_empty_req('WithdrawAndDeposit',3101,'Session has expired',amount);                  
                        send_reply(reply,res)
                      }else if(reason != 'ROUND_END') {
                        reply =  {
                            'WithdrawAndDepositResponse': {
                                'Balance': null,
                                'ErrorCode': 3105,
                                'CasinoTransferId': null,
                                'ErrorMessage': 'Invalid reason',
                                'TotalBet': null,
                                'TotalWin': null,
                                'PlayTime': null,
                            }
                        };
                        save_transfer_id(TransactionIdCollection, (t_id) => {
                            save_empty_req('WithdrawAndDeposit',3105,'Invalid reason',amount,t_id,user_found_name);                  
                            send_reply(reply,res)

                        })
                      } else {
                        var {player_id,balance, requests,_id} = user_found_name;
                        
                        
                 save_transfer_id(TransactionIdCollection, (t_id) => {
                                                   
                            
                            const request = new Transaction({op: "WithdrawAndDeposit",err_code: '1000',transfer_id: t_id,amount:amount,msg:'OK',user:_id})
                            save_player_req(User,_id,request);
                            withdraw_deposit(UserCollection,player_id,t_id,amount,bet,balance,res,wdr,send_reply);                        
                        })
                    }    
                })
 
                    } else if (undefined !== result['GetPlayerBalanceRequest']) {
                        var reply = {
                            'GetPlayerBalanceResponse': {
                                'Balance': 9000,
                                'ErrorCode': 1000,
                                'ErrorMessage': 'OK'
                            }
                        };
                        send_reply(reply, res);
                    } else {
                        console.log("unhandled key[%s], nothing to do..", key);
                        send_reply({ 'Error': { 'ErrorCode': 3000, 'ErrorMessage': 'unhandled command: [' + key +']'} }, res);
                    }
 
                });
            } catch (ex) {
                console.log('error parsing xml - ' + ex)
            }
        });
    });
});

 
 
    // https.createServer(https_options, app).on('connection', (socket) => {
    //     socket.setTimeout(10000);
    // }).listen(port);
    app.listen(port)
    console.log("listening");
 
    
}


// send back xml reply
function send_reply(json, res,token) {
    
    var xml_reply = builder.buildObject(json);

     res.send(xml_reply)
}
 
//resursion function to insert defence code in db
function save_def_code(collection,callback){
    var dc = gen_rand_code();
    collection.createIndex({"def_code": 1},{unique: true})    
    collection.insertOne({"def_code": dc}, function(err, result){
        if ( err ){
         save_def_code(collection)
         console.log ('Defence code has dublicate: %s',err); //info about what went wrong
          } 
        if (result){
         //console.log ( result.ops[0].def_code );
         callback(result.ops[0].def_code)
        } 
    })
}

//save transfer id to db 
function save_transfer_id(collection,callback){
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
}

//save successful transactions into db
function save_player_req(model,id,request){
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
}

//save empty transaction into db
function save_empty_req(op,err_code,msg,amount,transfer_id,user){
    var transaction = new Transaction({op,err_code,transfer_id,amount,msg,user})
    transaction.save().then(() => {
           console.log('transaction saved, babyyy')
    }).catch((err) => {
        console.log(err)
    })
}

//save player logs
function save_player_logs(op,player_name,player_balance,player_pass,player_id){
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
}


//get user with certain player_id
function get_user(collection,op,cb){
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
}

//make a bet 
function user_bet(collection, id,transfer_id, bet,balance,res,op,cb){

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
  }

//make a deposit
  function user_deposit(collection, id,transfer_id, deposit,balance,res,op,op_type,cb){
    
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
  }

  //withdraw and deposit
  function withdraw_deposit(collection, id,transfer_id, deposit,bet,balance,res,op,cb){
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
  }
 // generate unique defence
  function gen_rand_code() {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < 5; i++){
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    var hash = SHA256(text).toString()
  
    return hash;
  }

