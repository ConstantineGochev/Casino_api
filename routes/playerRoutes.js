const routes = require('../config/routes');
const {playersPath} = routes;
const helpers = require('../config/helpers')
const {save_player_logs} = helpers;
const mongoose = require('mongoose');
require('../models/user');
const User = mongoose.model('user');


//User operations create new user, get all users delete update
module.exports = (app) => {
    app.get(playersPath, (req, res)=>{
        // var page_num = parseInt(req.query.page_num),
        // size = parseInt(req.query.size),
        // query = {},
        // response
        // if(page_num < 0 || page_num === 0){
        //     response = {"error": true, "msg": "invalid page number shoud start at 1?!"}
        //     return res.json(response);
        //   }
        //   query.skip = size * (page_num - 1);
        //   query.limit = size;
        User.count({}, function(err, count){
        
            User.find(/*{},{}, query*/).then((users) => {
                if(err) {
                    response = {"msg": "Error fetching data"}
                }
                var total_players = Math.ceil(count);
                response = {"data":users, "total_players":total_players}
        
                res.json(response)
            }).catch((err) => {
                console.log(err)
            })
        })
      
    })

    app.post(playersPath, (req,res) => {
            
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
                }).then((user) => {
                    res.json({succes: true, msg: 'User registered', user})

               }).catch((err)=>{console.log(err)})
           
    })
    app.get(playersPath + '/:id', (req, res) => {
        User.findById({_id: req.params.id}).populate('requests')
        .then((user) => {
          res.send({"user":user})
           
         
        }).catch((err) => {
            console.log(err)
        })
    })

    app.put(playersPath + '/:id', (req, res) => {
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
    
    app.delete(playersPath + '/:id', (req, res) => {
        User.remove({_id:req.params.id})
        .then((user) => {
            save_player_logs('Player deleted',user.screenname,user.balance,user.password,user.player_id)
            res.send({msg: 'User deleted', user})

        }).catch((err) => {
            console.log(err);
        })
    })

}