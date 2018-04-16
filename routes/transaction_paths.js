const helpers = require('../config/helpers');
const {get_user,save_empty_req,save_player_req,send_reply,save_transfer_id,save_def_code,user_deposit,user_bet,withdraw_deposit} = helpers;
const keys = require('../config/keys');
const {mainPath} = keys;
var parseString = require('xml2js').parseString;
var qs = require('querystring');
const mongoose = require('mongoose');
require('../models/transactions');
require('../models/user');
const User = mongoose.model('user');

const Transaction = mongoose.model('transaction');



module.exports = (app,UserCollection,DefCodeCollection,TransactionIdCollection) => {

    app.get(mainPath, (req, res) =>{
       //console.log(req.session)
        save_def_code(DefCodeCollection,(dc)=>{
            req.session.dc = dc
            res.send(dc)
        })
     })
    

           //post requests
    app.post(mainPath,  (req, res) => {
      
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
})

}