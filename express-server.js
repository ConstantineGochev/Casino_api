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
const session = require('express-session');
const _ = require('lodash');
const keys = require('./config/keys');
const {cookie} = keys;


const port = process.env.PORT || 3000;

 
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

    // Tell express to use the body-parser middleware and to not parse extended bodies
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    
    const ConnectToDB = require('./config/db-connect')
    
    ConnectToDB(function(UserCollection,DefCodeCollection,TransactionIdCollection){
        console.log('connect to db invoked')
        
        //expess session
        //must have setting to set expiration of the session FIX
        const dc_expiry_seconds = 6000000
        //session inittialization
    
        app.use(session({ secret: cookie,
                          saveUninitialized: false,
                          resave:false,
                          cookie: { maxAge: dc_expiry_seconds }}));

        
         require('./routes/transaction_paths')(app,UserCollection,DefCodeCollection,TransactionIdCollection)
         require('./routes/player_paths')(app)
         require('./routes/requests_paths')(app)
         require('./routes/log_paths')(app)
         
       
});

 
 
    https.createServer(https_options, app).on('connection', (socket) => {
        socket.setTimeout(10000);
    }).listen(port);
   // app.listen(port)
    console.log("listening");
 
    
}


