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
mongoose.Promise = global.Promise;

const session = require('express-session');
const _ = require('lodash');
const cors = require('cors')
const keys = require('./config/keys');
//const debug = require('debug')('express-server');
const morgan = require('morgan')
const {cookie} = keys;


const port = process.env.PORT || 4000;

 
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
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cors());
    app.use(morgan('combined'))

    
    const ConnectToDB = require('./config/db-connect')
    
    ConnectToDB(function(UserCollection,DefCodeCollection,TransactionIdCollection, TransactionCollection){
        console.log('connect to db invoked')
        
        //expess session
        //must have setting to set expiration of the session FIX
        const dc_expiry_seconds = 6000000
        //session inittialization
    
        app.use(session({ secret: cookie,
                          saveUninitialized: false,
                          resave:false,
                          cookie: { maxAge: dc_expiry_seconds }}));

        // process.on('unhandledRejection', (reason, p) => {
        //     console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
        //     });
        require('./routes/logRoutes')(app)
        require('./routes/playerRoutes')(app)
        require('./routes/requestsRoutes')(app)
        require('./routes/transactionRoutes')(app,UserCollection,DefCodeCollection,TransactionIdCollection)
         
       
});

 
 
    https.createServer(https_options, app).on('connection', (socket) => {
        socket.setTimeout(10000);
    }).listen(port,() => {
        console.log("listening");
    });
     //app.listen(port)
 
    
}


