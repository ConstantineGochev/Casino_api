/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading wasm modules
/******/ 	var installedWasmModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// object with all compiled WebAssembly.Modules
/******/ 	__webpack_require__.w = {};
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./express-server.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./config/database.js":
/*!****************************!*\
  !*** ./config/database.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("if(false){}else{\r\n    module.exports = {\r\n        mongoURI: 'mongodb://localhost/egt_casino'\r\n    }\r\n}\n\n//# sourceURL=webpack:///./config/database.js?");

/***/ }),

/***/ "./config/db-connect.js":
/*!******************************!*\
  !*** ./config/db-connect.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const mongoose = __webpack_require__(/*! mongoose */ \"mongoose\");\r\nconst db = __webpack_require__(/*! ./database */ \"./config/database.js\");\r\n\r\nmodule.exports = (cb) =>{\r\n    mongoose.connect(db.mongoURI, function (err,db) {\r\n        if (err) {\r\n          return console.dir(err);\r\n        }\r\n        console.log('connected to db')\r\n        var UserCollection = db.collection('users'),\r\n            DefCodeCollection = db.collection('def_codes'),\r\n            TransactionIdCollection = db.collection('transaction_ids');\r\n\r\n            return cb(UserCollection,DefCodeCollection,TransactionIdCollection);    \r\n    });\r\n}\n\n//# sourceURL=webpack:///./config/db-connect.js?");

/***/ }),

/***/ "./express-server.js":
/*!***************************!*\
  !*** ./express-server.js ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\r\n \r\n \r\nconst CLUSTER_CHILDREN = 1;\r\n \r\n////////////////////////////\r\nconst https = __webpack_require__(/*! https */ \"https\")\r\nconst fs = __webpack_require__(/*! fs */ \"fs\");\r\nconst express = __webpack_require__(/*! express */ \"express\")\r\nconst bodyParser = __webpack_require__(/*! body-parser */ \"body-parser\")\r\nconst xmlparser = __webpack_require__(/*! express-xml-bodyparser */ \"express-xml-bodyparser\");\r\nconst express_json = __webpack_require__(/*! express-json */ \"express-json\");\r\nvar cluster = __webpack_require__(/*! cluster */ \"cluster\");\r\nconst mongoose = __webpack_require__(/*! mongoose */ \"mongoose\");\r\nconst morgan = __webpack_require__(/*! morgan */ \"morgan\")\r\nconst session = __webpack_require__(/*! express-session */ \"express-session\");\r\nconst {SHA256} = __webpack_require__(/*! crypto-js */ \"crypto-js\");\r\nconst _ = __webpack_require__(/*! lodash */ \"lodash\");\r\n\r\n\r\n\r\n//json web token ?\r\n// const expressJWT = require('express-jwt');\r\n// const jwt = require('jsonwebtoken');\r\n\r\n\r\nconst port = process.env.PORT || 3000;\r\n\r\n\r\nconst xml2js = __webpack_require__(/*! xml2js */ \"xml2js\");\r\nvar builder = new xml2js.Builder();\r\nvar parseString = __webpack_require__(/*! xml2js */ \"xml2js\").parseString;\r\nvar qs = __webpack_require__(/*! querystring */ \"querystring\");\r\nvar ObjectID = __webpack_require__(/*! mongodb */ \"mongodb\").ObjectID;   \r\n\r\n\r\n//load user model\r\n__webpack_require__(/*! ./models/user */ \"./models/user.js\");\r\n__webpack_require__(/*! ./models/transactions */ \"./models/transactions.js\");\r\n__webpack_require__(/*! ./models/player_logs */ \"./models/player_logs.js\");\r\nconst Player_Log = mongoose.model('player_logs');\r\nconst Transaction = mongoose.model('transaction');\r\nconst User = mongoose.model('user');\r\n\r\n \r\n// Create a new instance of express\r\nvar https_options = {\r\n    key: fs.readFileSync('./certs/key.pem'),\r\n    cert: fs.readFileSync('./certs/cert.pem'),\r\n};\r\n\r\n \r\n \r\nif (cluster.isMaster) {\r\n    // console.log(\"helo master\");\r\n    for (var i=0; i<CLUSTER_CHILDREN; i++) {\r\n        cluster.fork();\r\n    }\r\n \r\n} else if (cluster.isWorker) {\r\n \r\n    const app = express();\r\n\r\n    //morgan middleware\r\n    app.use(morgan('dev'));\r\n    // Tell express to use the body-parser middleware and to not parse extended bodies\r\n    app.use(bodyParser.urlencoded({ extended: false }));\r\n    app.use(bodyParser.json());\r\n\r\n    \r\n    const ConnectToDB = __webpack_require__(/*! ./config/db-connect */ \"./config/db-connect.js\")\r\n    \r\n    ConnectToDB(function(UserCollection,DefCodeCollection,TransactionIdCollection){\r\n        console.log('connect to db invoked')\r\n        \r\n        //expess session\r\n        //must have setting to set expiration of the session FIX\r\n        const dc_expiry_seconds = 6000000\r\n        app.use(session({ secret: 'this-is-a-secret-token',\r\n                          saveUninitialized: false,\r\n                          resave:false,\r\n                          cookie: { maxAge: dc_expiry_seconds }}));\r\n        \r\n        // Routes\r\n        var path = '/new_path/apiv2/entry',\r\n            players_path = '/new_path/apiv2/entry/players',\r\n            req_path = '/new_path/apiv2/entry/requests',\r\n            log_path = '/new_path/apiv2/entry/logs'\r\n        //get request generates defence code \r\n        app.get(path, function(req, res){\r\n           save_def_code(DefCodeCollection,(dc)=>{\r\n               var session = req.session;\r\n               session.dc = dc\r\n               res.send(dc)\r\n           })\r\n           console.log('session id === %s',session.id)\r\n\r\n        })\r\n        //get all users \r\n        app.get(players_path, (req, res)=>{\r\n            var page_num = parseInt(req.query.page_num),\r\n            size = parseInt(req.query.size),\r\n            query = {},\r\n            response\r\n            if(page_num < 0 || page_num === 0){\r\n                response = {\"error\": true, \"msg\": \"invalid page number shoud start at 1?!\"}\r\n                return res.json(response);\r\n              }\r\n              query.skip = size * (page_num - 1);\r\n              query.limit = size;\r\n            User.count({}, function(err, count){\r\n            \r\n                User.find({},{}, query).populate('requests').then((users) => {\r\n                    if(err) {\r\n                        response = {\"error\":true, \"msg\": \"Error fetching data\"}\r\n                    }\r\n                    var total_pages = Math.ceil(count / size);\r\n                    response = {\"error\": false, \"data\":users, \"pages\":total_pages}\r\n                    res.json(response)\r\n                }).catch((err) => {\r\n                    console.log(err)\r\n                })\r\n            })\r\n          \r\n        })\r\n        //get all requests\r\n        app.get(req_path, (req, res) => {\r\n            var page_num = parseInt(req.query.page_num),\r\n                size = parseInt(req.query.size),\r\n                query = {},\r\n                response\r\n            if(page_num < 0 || page_num === 0){\r\n                   response = {\"error\": true, \"msg\": \"invalid page number shoud start at 1?!\"}\r\n                   return res.json(response);\r\n            }\r\n            query.skip = size * (page_num - 1);\r\n            query.limit = size;\r\n\r\n            Transaction.count({},function(err, count){\r\n\r\n                Transaction.find({},{},query).populate('user').then((requests) => {\r\n                    if(err) {\r\n                        response = {\"error\":true, \"msg\": \"Error fetching data\"}\r\n                    }\r\n                    var total_pages = Math.ceil(count / size);\r\n                    response = {\"error\": false, \"data\":requests, \"pages\":total_pages}\r\n                    res.json(response)\r\n                }).catch((err) => {\r\n                    console.log(err)\r\n                })\r\n            })\r\n        })\r\n\r\n        //get all player logs\r\n        app.get(log_path, (req, res) => {\r\n            var page_num = parseInt(req.query.page_num),\r\n            size = parseInt(req.query.size),\r\n            query = {},\r\n            response\r\n        if(page_num < 0 || page_num === 0){\r\n               response = {\"error\": true, \"msg\": \"invalid page number shoud start at 1?!\"}\r\n               return res.json(response);\r\n        }\r\n        query.skip = size * (page_num - 1);\r\n        query.limit = size;\r\n        Player_Log.count({},function(err, count){\r\n\r\n            Player_Log.find({},{},query).then((logs) => {\r\n                if(err) {\r\n                    response = {\"error\":true, \"msg\": \"Error fetching data\"}\r\n                }\r\n                var total_pages = Math.ceil(count / size);\r\n                response = {\"error\": false, \"data\":logs, \"pages\":total_pages}\r\n                res.json(response)\r\n            }).catch((err) => {\r\n                console.log(err)\r\n            })\r\n        })\r\n     })\r\n\r\n        //create a new user \r\n        app.post(players_path, (req,res) => {\r\n            \r\n            const new_user = new User({\r\n                player_id: req.body.player_id,\r\n                screenname:req.body.screenname,\r\n                password: req.body.password,\r\n                balance: req.body.balance,\r\n                banned: req.body.banned\r\n            });\r\n                   new_user.save(function(err, user) {\r\n                      // console.log(err)\r\n                       if(err){\r\n                           if(err.code === 11000){\r\n                               return res.status(500).send({succes:false, msg:'User already exists'});\r\n                           }\r\n                               return res.status(500).send({succes: false, msg: 'Opss something went wrong with the database',err})\r\n                       }\r\n                       save_player_logs('Player created',user.screenname,user.balance,user.password,user.player_id)\r\n                       res.json({succes: true, msg: 'User registered', user})\r\n                   })\r\n               \r\n        })\r\n        //edit a player\r\n        app.put(players_path + '/:id', (req, res) => {\r\n            User.findOne({_id: req.params.id})\r\n            .then((user) => {\r\n                user.player_id = req.body.player_id,\r\n                user.screenname = req.body.screenname,\r\n                user.password = req.body.password,\r\n                user.balance = req.body.balance,\r\n                user.banned = req.body.banned\r\n                user.save()\r\n                .then((user) => {\r\n                    save_player_logs('Player credentials changed',user.screenname,user.balance,user.password,user.player_id)\r\n                    res.send({msg: 'User updated', user})\r\n                }).catch((err) => {\r\n                    console.log(err)\r\n                })\r\n            }).catch((err) => {\r\n                console.log(err)\r\n            })\r\n        })\r\n        //delete a player\r\n        app.delete(players_path + '/:id', (req, res) => {\r\n            User.remove({_id:req.params.id})\r\n            .then((user) => {\r\n                save_player_logs('Player deleted',user.screenname,user.balance,user.password,user.player_id)\r\n                res.send({msg: 'User deleted', user})\r\n\r\n            }).catch((err) => {\r\n                console.log(err);\r\n            })\r\n        })\r\n\r\n        //post requests\r\n        app.post(path,  (req, res) => {\r\n      \r\n                var body = '';\r\n                var session_dc = req.session.dc\r\n                \r\n                req.on('data', function (data) {\r\n                    body += data;\r\n                    // Too much POST data, kill the connection! // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB\r\n                    if (body.length > 1e6)\r\n                    req.connection.destroy();\r\n                });\r\n                \r\n                req.on('end',  () => {\r\n                    var post = qs.parse(body);\r\n\r\n                    try {\r\n                    \r\n                            var json = parseString(body,  (err, result) => {\r\n                                if (err) {\r\n                                    console.log(\"go err:\", err);\r\n                                    return;\r\n                                }\r\n                                //  console.log(result); // <<-\r\n                                var key = Object.keys(result)[0];\r\n                                //authenticate request        \r\n                                if (undefined !== result['AuthRequest']) {\r\n                                    console.log(key)\r\n                            var ar = result['AuthRequest'];\r\n\r\n                             console.log(ar.DefenceCode[0])\r\n                             var req_dc = ar.DefenceCode[0]\r\n\r\n\r\n                             //the session defence code\r\n                             //console.log('this is the sesison dc  ==== %s', req.session.dc)\r\n                                    var reply;\r\n                             //console.log(\"================================================\\n\\n\")\r\n                             //console.log(req.session.cookie.maxAge)\r\n                                 \r\n                                    // done or error\r\n                       \r\n                         get_user(UserCollection,ar,(user_found_id, user_found_name) => {\r\n                             \r\n                            console.log(user_found_id)\r\n                            console.log(user_found_name)            \r\n                                        \r\n                            if (null == user_found_id && null == user_found_name) {\r\n                                // greshka\r\n                                reply = {\r\n                                   'AuthResponse': {\r\n                                    'Balance': null,\r\n                                    'ErrorCode': 3000,\r\n                                    'ErrorMessage': 'User not found'\r\n                                        }\r\n                                   };\r\n                               save_empty_req('Authenticate',3000,'User not found')\r\n                                   \r\n                                            // console.log(user_found)\r\n                             }else if(user_found_name == null){\r\n                                \r\n                                reply = {\r\n                                    'AuthResponse': {\r\n                                    'Balance': null,\r\n                                    'ErrorCode': 3102,\r\n                                    'ErrorMessage': 'Wrong username or password'\r\n                                    }\r\n                                };\r\n                              save_empty_req('Authenticate',3102,'Wrong username or password')\r\n                         \r\n                             } else if(user_found_id == null || user_found_id.player_id != user_found_name.player_id){\r\n                                reply = {\r\n                                    'AuthResponse': {\r\n                                    'Balance': null,\r\n                                    'ErrorCode': 3104,\r\n                                    'ErrorMessage': 'Wrong player ID'\r\n                                    }\r\n                                };\r\n                               save_empty_req('Authenticate',3104,'Wrong player ID')\r\n                                \r\n                             }else if(user_found_name.banned === true){\r\n                                reply = {\r\n                                    'AuthResponse': {\r\n                                    'Balance': null,\r\n                                    'ErrorCode': 3103,\r\n                                    'ErrorMessage': 'Player is banned'\r\n                                    }\r\n                                };\r\n                               save_empty_req('Authenticate',3103,'Player is banned')\r\n                                \r\n                             }else if(undefined === session_dc){\r\n                                reply = {\r\n                                    'AuthResponse': {\r\n                                    'Balance': null,\r\n                                    'ErrorCode': 3101,\r\n                                    'ErrorMessage': 'Session has expired'\r\n                                    }\r\n                                };\r\n                               save_empty_req('Authenticate',3101,'Session has expired')\r\n                                \r\n                             }   else if(req_dc != session_dc){\r\n                                 reply = {\r\n                                    'AuthResponse': {\r\n                                    'Balance': null,\r\n                                    'ErrorCode': 3100,\r\n                                    'ErrorMessage': 'Wrong defence code'\r\n                                    }\r\n                                };\r\n                               save_empty_req('Authenticate',3100,'Wrong defence code',null,null,user_found_name)\r\n                                \r\n                             }else {\r\n                               \r\n                                 reply = {\r\n                                    'AuthResponse': {\r\n                                    'Balance': user_found_name.balance,                                       'ErrorCode': 1000,\r\n                                    'ErrorMessage': 'OK'\r\n                                    }\r\n                                };\r\n                               // console.log(user_found)                            \r\n                            const request = new Transaction({op: \"Authenticate\",err_code: '1000',msg:'OK',user:user_found_name._id})\r\n\r\n                              save_player_req(User,user_found_name._id,request);\r\n                                \r\n                            }\r\n                           send_reply(reply, res)\r\n\r\n                        });                        \r\n                \r\n\r\n                        //var xml_reply = builder.buildObject(reply);\r\n                        //res.send(xml_reply)\r\n                     //withdraw request start\r\n                    } else if (undefined !== result['WithdrawRequest']) {\r\n                        var wr = result['WithdrawRequest'];\r\n                        var reply;\r\n                        \r\n                        // done or error\r\n                get_user(UserCollection,wr,(user_found_id, user_found_name) => {\r\n                            var amount = JSON.parse(wr.Amount[0]);\r\n                            var reason = wr.Reason[0]\r\n                            console.log('reason === %s', reason)                        \r\n                            \r\n                      if (null == user_found_id && null == user_found_name) {\r\n                          // greshka\r\n                          reply =  {\r\n                            'WithdrawResponse': {\r\n                                'Balance': null,\r\n                                'ErrorCode': 3000,\r\n                                'CasinoTransferId': null,\r\n                                'ErrorMessage': 'User not found',\r\n                                'TotalBet': null,\r\n                                'TotalWin': null,\r\n                                'PlayTime': null,\r\n                            }\r\n                        };\r\n                         save_empty_req('Withdraw',3000,'User not found',amount)\r\n                         send_reply(reply,res)\r\n                      }else if(user_found_name == null){\r\n                        reply =  {\r\n                            'WithdrawResponse': {\r\n                                'Balance': null,\r\n                                'ErrorCode': 3101,\r\n                                'CasinoTransferId': null,\r\n                                'ErrorMessage': 'Wrong player name or password',\r\n                                'TotalBet': null,\r\n                                'TotalWin': null,\r\n                                'PlayTime': null,\r\n                            }\r\n                        };\r\n                        save_empty_req('Withdraw',3101,'Wrong player name or password',amount)         \r\n                        send_reply(reply,res)\r\n\r\n                      } else if(user_found_id == null || user_found_id.player_id != user_found_name.player_id){\r\n                        reply =  {\r\n                            'WithdrawResponse': {\r\n                                'Balance': null,\r\n                                'ErrorCode': 3104,\r\n                                'CasinoTransferId': null,\r\n                                'ErrorMessage': 'Wrong player ID',\r\n                                'TotalBet': null,\r\n                                'TotalWin': null,\r\n                                'PlayTime': null,\r\n                            }\r\n                        };\r\n                        save_empty_req('Withdraw',3104,'Wrong player ID',amount)                                 \r\n                        send_reply(reply,res)\r\n\r\n                      }else if(user_found_name.balance < wr.Amount[0]){\r\n                        reply =  {\r\n                            'WithdrawResponse': {\r\n                                'Balance': null,\r\n                                'ErrorCode': 3103,\r\n                                'CasinoTransferId': null,\r\n                                'ErrorMessage': 'Insufficient balance',\r\n                                'TotalBet': null,\r\n                                'TotalWin': null,\r\n                                'PlayTime': null,\r\n                            }\r\n                        };\r\n                        save_transfer_id(TransactionIdCollection, (t_id) => {\r\n                            save_empty_req('Withdraw',3103,'Insufficient balance',amount,t_id,user_found_name)\r\n                            send_reply(reply,res)\r\n\r\n                        })\r\n\r\n                      } else if(undefined === session_dc){\r\n                          reply =  {\r\n                            'WithdrawResponse': {\r\n                                'Balance': null,\r\n                                'ErrorCode': 3102,\r\n                                'CasinoTransferId': null,\r\n                                'ErrorMessage': 'Session has expired',\r\n                                'TotalBet': null,\r\n                                'TotalWin': null,\r\n                                'PlayTime': null,\r\n                            }\r\n                        };\r\n                        save_empty_req('Withdraw',3101,'Session has expired',amount);                  \r\n                        send_reply(reply,res)\r\n                      }else if(reason != 'ROUND_BEGIN') {\r\n                        reply =  {\r\n                            'WithdrawResponse': {\r\n                                'Balance': null,\r\n                                'ErrorCode': 3105,\r\n                                'CasinoTransferId': null,\r\n                                'ErrorMessage': 'Invalid reason',\r\n                                'TotalBet': null,\r\n                                'TotalWin': null,\r\n                                'PlayTime': null,\r\n                            }\r\n                        };\r\n                        save_transfer_id(TransactionIdCollection, (t_id) => {\r\n                            save_empty_req('Withdraw',3105,'Invalid reason',amount,t_id,user_found_name);                  \r\n                            send_reply(reply,res)\r\n\r\n                        })\r\n                      } else {\r\n                        var {player_id,balance, requests,_id} = user_found_name;\r\n                        \r\n                        \r\n                 save_transfer_id(TransactionIdCollection, (t_id) => {\r\n                                                   \r\n                            \r\n                            const request = new Transaction({op: \"Withdraw\",err_code: '1000',transfer_id: t_id,amount:amount,msg:'OK',user:_id})\r\n                            save_player_req(User,_id,request);\r\n                            user_bet(UserCollection,player_id,t_id,amount,balance,res,wr,send_reply)\r\n                        })\r\n                    }    \r\n                })\r\n                \r\n                    //deposit request start\r\n                    } else if (undefined !== result['DepositRequest']) {\r\n                        var dr = result['DepositRequest'];\r\n                        //var session_dc = req.session.dc\r\n                        var reply;\r\n                        \r\n              get_user(UserCollection,dr,(user_found_id, user_found_name) => {   \r\n                            var amount = JSON.parse(dr.Amount[0]);\r\n                            var reason = dr.Reason[0]                        \r\n                      // done or error\r\n                      if (null == user_found_id && null == user_found_name) {\r\n                          // greshka\r\n                          reply =  {\r\n                            'DepositResponse': {\r\n                                'Balance': null,\r\n                                'ErrorCode': 3000,\r\n                                'CasinoTransferId': null,\r\n                                'ErrorMessage': 'User not found',\r\n                                'TotalDeposit': null,\r\n                                'TotalWin': null,\r\n                                'PlayTime': null,\r\n                            }\r\n                        };\r\n                         save_empty_req('Deposit',3000,'User not found',amount);                                          \r\n                         send_reply(reply,res)\r\n                      }else if(user_found_name == null){\r\n                        reply =  {\r\n                            'DepositResponse': {\r\n                                'Balance': null,\r\n                                'ErrorCode': 3100,\r\n                                'CasinoTransferId': null,\r\n                                'ErrorMessage': 'Wrong username or password',\r\n                                'TotalDeposit': null,\r\n                                'TotalWin': null,\r\n                                'PlayTime': null,\r\n                            }\r\n                        };\r\n                        save_empty_req('Deposit',3100,'Wrong username or password',amount);                                                                  \r\n                        send_reply(reply,res)\r\n                          \r\n\r\n                      } else if(user_found_id == null || user_found_id.player_id != user_found_name.player_id){\r\n                        reply =  {\r\n                            'DepositResponse': {\r\n                                'Balance': null,\r\n                                'ErrorCode': 3102,\r\n                                'CasinoTransferId': null,\r\n                                'ErrorMessage': 'Wrong player ID',\r\n                                'TotalDeposit': null,\r\n                                'TotalWin': null,\r\n                                'PlayTime': null,\r\n                            }\r\n                        };\r\n                        save_empty_req('Deposit',3102,'Wrong player ID',amount);                                                                                          \r\n                        send_reply(reply,res)\r\n                          \r\n\r\n                      } else if(undefined === session_dc){\r\n                        reply =  {\r\n                          'DepositResponse': {\r\n                              'Balance': null,\r\n                              'ErrorCode': 3101,\r\n                              'CasinoTransferId': null,\r\n                              'ErrorMessage': 'Session has expired',\r\n                              'TotalDeposit': null,\r\n                              'TotalWin': null,\r\n                              'PlayTime': null,\r\n                          }\r\n                      };\r\n                      save_empty_req('Deposit',3101,'Session has expired',amount);                                                                          \r\n                      send_reply(reply,res)\r\n                    }else if(reason != 'ROUND_END'){\r\n                        reply =  {\r\n                            'DepositResponse': {\r\n                                'Balance': null,\r\n                                'ErrorCode': 3105,\r\n                                'CasinoTransferId': null,\r\n                                'ErrorMessage': 'Invalid reason',\r\n                                'TotalDeposit': null,\r\n                                'TotalWin': null,\r\n                                'PlayTime': null,\r\n                            }\r\n                        };\r\n                        save_transfer_id(TransactionIdCollection, (t_id) => {\r\n\r\n                            save_empty_req('Deposit',3105,'Invalid reason',amount,t_id,user_found_name);                                                                          \r\n                            send_reply(reply,res)\r\n                        })\r\n                    } else {\r\n                        var {player_id,balance,_id} = user_found_name\r\n\r\n                        \r\n                        save_transfer_id(TransactionIdCollection, (t_id) => {                     \r\n                            \r\n                            const request = new Transaction({op: \"Deposit\",err_code: '1000',transfer_id: t_id,amount:amount,msg:'OK',user:_id})\r\n\r\n                            save_player_req(User,_id,request);\r\n                            user_deposit(UserCollection,player_id,t_id,amount,balance,res,dr,send_reply)\r\n                        })\r\n                    }    \r\n                })\r\n \r\n                    } else if (undefined !== result['RefundRequest']) {\r\n                        var wr = result['RefundRequest'];\r\n                        var code = 1000;\r\n                        if (wr.PlayerId >= 1000 && wr.PlayerId <= 9999) code = wr.PlayerId;\r\n                        if (code >= 1000 && code <= 1999) player_win(wr.PlayerId, wr.Amount);\r\n                        var reply = {\r\n                            'RefundResponse': {\r\n                                'Balance': player_get_balance(wr.PlayerId),\r\n                                'ErrorCode': code,\r\n                                'CasinoTransferId': '48a36d8dfb75c7d35797e40aea09ca24',\r\n                                'ErrorMessage': 'OK',\r\n                                'TotalBet': 500,\r\n                                'TotalWin': 400,\r\n                                'PlayTime': 2,\r\n                            }\r\n                        };\r\n                        send_reply(reply, res);\r\n \r\n                    } else if (undefined !== result['WithdrawAndDepositRequest']) {\r\n                        var wr = result['WithdrawAndDepositRequest'];\r\n                        var code = 1000;\r\n                        if (wr.PlayerId >= 1000 && wr.PlayerId <= 9999) code = wr.PlayerId;\r\n                        var reply = {\r\n                            'WithdrawAndDepositResponse': {\r\n                                'Balance': 10000,\r\n                                'ErrorCode': code,\r\n                                'CasinoTransferId': '48a36d8dfb75c7d35797e40aea09ca24',\r\n                                'ErrorMessage': 'OK',\r\n                                'TotalBet': 500,\r\n                                'TotalWin': 400,\r\n                                'PlayTime': 2,\r\n                            }\r\n                        };\r\n                        send_reply(reply, res);\r\n \r\n                    } else if (undefined !== result['GetPlayerBalanceRequest']) {\r\n                        var reply = {\r\n                            'GetPlayerBalanceResponse': {\r\n                                'Balance': 9000,\r\n                                'ErrorCode': 1000,\r\n                                'ErrorMessage': 'OK'\r\n                            }\r\n                        };\r\n                        send_reply(reply, res);\r\n                    } else {\r\n                        console.log(\"unhandled key[%s], nothing to do..\", key);\r\n                        send_reply({ 'Error': { 'ErrorCode': 3000, 'ErrorMessage': 'unhandled command: [' + key +']'} }, res);\r\n                    }\r\n \r\n                });\r\n            } catch (ex) {\r\n                console.log('error parsing xml - ' + ex)\r\n            }\r\n        });\r\n    });\r\n});\r\n\r\n \r\n \r\n    https.createServer(https_options, app).on('connection', (socket) => {\r\n        socket.setTimeout(10000);\r\n    }).listen(port);\r\n \r\n    console.log(\"listening\");\r\n \r\n    \r\n}\r\n\r\n// send back xml reply\r\nfunction send_reply(json, res,token) {\r\n    \r\n    var xml_reply = builder.buildObject(json);\r\n\r\n     res.send(xml_reply)\r\n}\r\n\r\n//resursion function to insert defence code in db\r\nfunction save_def_code(collection,callback){\r\n    var dc = gen_rand_code();\r\n    collection.createIndex({\"def_code\": 1},{unique: true})    \r\n    collection.insertOne({\"def_code\": dc}, function(err, result){\r\n        if ( err ){\r\n         save_def_code(collection)\r\n         console.log ('Defence code has dublicate: %s',err); //info about what went wrong\r\n          } \r\n        if (result){\r\n         //console.log ( result.ops[0].def_code );\r\n         callback(result.ops[0].def_code)\r\n        } \r\n    })\r\n}\r\n\r\n//save transfer id to db \r\nfunction save_transfer_id(collection,callback){\r\n    var id = gen_rand_code();\r\n    collection.createIndex({\"transfer_id\": 1},{unique: true})    \r\n    collection.insertOne({\"transfer_id\": id}, function(err, result){\r\n        if ( err ){\r\n            save_transfer_id(collection)\r\n            console.log ('Transfer ID has dublicate: %s',err); //info about what went wrong\r\n          } \r\n        if (result){\r\n         //console.log ( result.ops[0].def_code );\r\n         callback(result.ops[0].transfer_id)\r\n        } \r\n    })\r\n}\r\n\r\n//save successful transactions into db\r\nfunction save_player_req(model,id,request){\r\n    model.findById(id)\r\n    .then((user) => {\r\n        user.requests.push(request)\r\n        Promise.all([user.save(),request.save()]).then(() =>{\r\n            console.log('user and request saved ?')\r\n        }).catch((err) => {\r\n            console.log('ooops something went wrong: %s',err)\r\n        })\r\n    })\r\n    .catch((err) => {\r\n        console.log(err)\r\n    })\r\n}\r\n\r\n//save empty transaction into db\r\nfunction save_empty_req(op,err_code,msg,amount,transfer_id,user){\r\n    var transaction = new Transaction({op,err_code,transfer_id,amount,msg,user})\r\n    transaction.save().then(() => {\r\n           console.log('transaction saved, babyyy')\r\n    }).catch((err) => {\r\n        console.log(err)\r\n    })\r\n}\r\n\r\n//save player logs\r\nfunction save_player_logs(op,player_name,player_balance,player_pass,player_id){\r\n    var log = new Player_Log({\r\n        op,\r\n        player_name,\r\n        player_balance,\r\n        player_pass,\r\n        player_id\r\n    })\r\n    log.save().then(() => {\r\n        console.log('Player log saved')\r\n    }).catch((err) => {\r\n        console.log(err)\r\n    })\r\n}\r\n\r\n\r\n//get user with certain player_id\r\nfunction get_user(collection,op,cb){\r\n    var found_user_id,\r\n        found_user_name\r\n\r\n    collection.find().forEach(function(user){\r\n      //  console.log(user.player_id)\r\n        if(user.player_id == op.PlayerId[0]){\r\n            found_user_id = user;\r\n            }\r\n        if(user.screenname == op.UserName[0] && user.password == op.Password[0]){\r\n            found_user_name = user\r\n        }\r\n            //here item is record. ie. what you have to do with each record.\r\n           \r\n        }, function(err){\r\n            if(err){\r\n                console.log(err)\r\n            }\r\n            cb(found_user_id,found_user_name)\r\n        })\r\n}\r\n\r\n//make a bet \r\nfunction user_bet(collection, id,transfer_id, bet,balance,res,op,cb){\r\n\r\n    collection.update({\"player_id\": id}, {$set:{\"balance\": balance - bet}}, function(err, result){\r\n        if (err) {\r\n            console.log('Error updating object: ' + err);\r\n        } else {\r\n        \r\n           var user_found = null;\r\n          \r\n           collection.find().forEach(function(user){\r\n               //  console.log(user.player_id)\r\n               if(user.player_id == op.PlayerId[0]){\r\n                  user_found = user\r\n                         \r\n              } \r\n          }, function(err) {\r\n              \r\n             // console.log('' + result + ' document(s) updated');\r\n              var reply =  {\r\n                'WithdrawResponse': {\r\n                    'Balance': user_found.balance,\r\n                    'ErrorCode': 1000,\r\n                    'CasinoTransferId': transfer_id,\r\n                    'ErrorMessage': 'OK',\r\n                    'TotalBet': bet,\r\n                    'TotalWin': 400,\r\n                    'PlayTime': 2,\r\n                }\r\n            };\r\n              cb(reply,res) \r\n          })\r\n        }\r\n    });\r\n  }\r\n\r\n//make a deposit\r\n  function user_deposit(collection, id,transfer_id, deposit,balance,res,op,cb){\r\n\r\n    collection.update({\"player_id\": id}, {$set:{\"balance\": balance + deposit}}, function(err, result){\r\n        if (err) {\r\n            console.log('Error updating object: ' + err);\r\n        } else {\r\n        \r\n           var user_found = null;\r\n          \r\n           collection.find().forEach(function(user){\r\n               //  console.log(user.player_id)\r\n               if(user.player_id == op.PlayerId[0]){\r\n                  user_found = user\r\n                         \r\n              } \r\n          }, function(err) {\r\n              \r\n             // console.log('' + result + ' document(s) updated');\r\n              var reply =  {\r\n                'DepositResponse': {\r\n                    'Balance': user_found.balance,\r\n                    'ErrorCode': 1000,\r\n                    'CasinoTransferId': transfer_id,\r\n                    'ErrorMessage': 'OK',\r\n                    'TotalDeposit': deposit,\r\n                    'TotalWin': 400,\r\n                    'PlayTime': 2,\r\n                }\r\n            };\r\n              cb(reply,res) \r\n          })\r\n        }\r\n    });\r\n  }\r\n // generate unique defence\r\n  function gen_rand_code() {\r\n    var text = \"\";\r\n    var possible = \"abcdefghijklmnopqrstuvwxyz0123456789\";\r\n  \r\n    for (var i = 0; i < 5; i++){\r\n        text += possible.charAt(Math.floor(Math.random() * possible.length));\r\n    }\r\n    var hash = SHA256(text).toString()\r\n  \r\n    return hash;\r\n  }\r\n\r\n\n\n//# sourceURL=webpack:///./express-server.js?");

/***/ }),

/***/ "./models/player_logs.js":
/*!*******************************!*\
  !*** ./models/player_logs.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const mongoose = __webpack_require__(/*! mongoose */ \"mongoose\");\r\nconst Schema = mongoose.Schema;\r\n\r\n\r\nconst PlayerLogsSchema = new Schema({\r\n    op: {\r\n        type: String\r\n    },\r\n    player_name: {\r\n        type: String\r\n    },\r\n    player_balance: {\r\n        type: Number\r\n    },\r\n    player_pass: {\r\n        type: String\r\n    },\r\n    player_id: {\r\n        type: String\r\n    },\r\n    created: {\r\n        type: Date,\r\n        default: Date.now()\r\n    }\r\n  \r\n});\r\n\r\nmongoose.model('player_logs', PlayerLogsSchema);\n\n//# sourceURL=webpack:///./models/player_logs.js?");

/***/ }),

/***/ "./models/transactions.js":
/*!********************************!*\
  !*** ./models/transactions.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const mongoose = __webpack_require__(/*! mongoose */ \"mongoose\");\r\nconst Schema = mongoose.Schema;\r\n\r\n\r\n//Create schema\r\nconst TransactionSchema = new Schema({\r\n    op: {\r\n        type: String,\r\n    },\r\n    err_code: {\r\n       type: String\r\n    },\r\n    transfer_id: {\r\n       type: String\r\n    },\r\n    msg: {\r\n        type: String\r\n    },\r\n    amount: {\r\n        type: Number\r\n    },\r\n    user: [{type: Schema.Types.ObjectId, ref: 'user'}],\r\n    created: {\r\n        type: Date,\r\n        default: Date.now()\r\n    }\r\n  \r\n});\r\n\r\nmongoose.model('transaction', TransactionSchema);\r\n\r\n\n\n//# sourceURL=webpack:///./models/transactions.js?");

/***/ }),

/***/ "./models/user.js":
/*!************************!*\
  !*** ./models/user.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const mongoose = __webpack_require__(/*! mongoose */ \"mongoose\");\r\nconst Schema = mongoose.Schema;\r\n\r\n\r\n//Create schema\r\nconst userSchema = new Schema({\r\n    player_id: {\r\n        type: Number,\r\n        unique: true       \r\n    },\r\n    screenname: {\r\n        type: String,\r\n        unique: true               \r\n    },\r\n    password: {\r\n        type:String,\r\n        unique: true               \r\n    },\r\n    balance: {\r\n        type: Number,\r\n    },\r\n    banned: {\r\n        type: Boolean,\r\n        default: false\r\n    },\r\n    requests: [{type: Schema.Types.ObjectId, ref: 'transaction'}],\r\n    created: {\r\n        type: Date,\r\n        default: Date.now()\r\n    }\r\n});\r\n\r\nmongoose.model('user', userSchema);\n\n//# sourceURL=webpack:///./models/user.js?");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"body-parser\");\n\n//# sourceURL=webpack:///external_%22body-parser%22?");

/***/ }),

/***/ "cluster":
/*!**************************!*\
  !*** external "cluster" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"cluster\");\n\n//# sourceURL=webpack:///external_%22cluster%22?");

/***/ }),

/***/ "crypto-js":
/*!****************************!*\
  !*** external "crypto-js" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"crypto-js\");\n\n//# sourceURL=webpack:///external_%22crypto-js%22?");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express\");\n\n//# sourceURL=webpack:///external_%22express%22?");

/***/ }),

/***/ "express-json":
/*!*******************************!*\
  !*** external "express-json" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express-json\");\n\n//# sourceURL=webpack:///external_%22express-json%22?");

/***/ }),

/***/ "express-session":
/*!**********************************!*\
  !*** external "express-session" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express-session\");\n\n//# sourceURL=webpack:///external_%22express-session%22?");

/***/ }),

/***/ "express-xml-bodyparser":
/*!*****************************************!*\
  !*** external "express-xml-bodyparser" ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"express-xml-bodyparser\");\n\n//# sourceURL=webpack:///external_%22express-xml-bodyparser%22?");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"https\");\n\n//# sourceURL=webpack:///external_%22https%22?");

/***/ }),

/***/ "lodash":
/*!*************************!*\
  !*** external "lodash" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"lodash\");\n\n//# sourceURL=webpack:///external_%22lodash%22?");

/***/ }),

/***/ "mongodb":
/*!**************************!*\
  !*** external "mongodb" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"mongodb\");\n\n//# sourceURL=webpack:///external_%22mongodb%22?");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"mongoose\");\n\n//# sourceURL=webpack:///external_%22mongoose%22?");

/***/ }),

/***/ "morgan":
/*!*************************!*\
  !*** external "morgan" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"morgan\");\n\n//# sourceURL=webpack:///external_%22morgan%22?");

/***/ }),

/***/ "querystring":
/*!******************************!*\
  !*** external "querystring" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"querystring\");\n\n//# sourceURL=webpack:///external_%22querystring%22?");

/***/ }),

/***/ "xml2js":
/*!*************************!*\
  !*** external "xml2js" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"xml2js\");\n\n//# sourceURL=webpack:///external_%22xml2js%22?");

/***/ })

/******/ });