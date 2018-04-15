const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//Create schema
const userSchema = new Schema({
    player_id: {
        type: Number,
        unique: true       
    },
    screenname: {
        type: String,
        unique: true               
    },
    password: {
        type:String,
        unique: true               
    },
    balance: {
        type: Number,
    },
    banned: {
        type: Boolean,
        default: false
    },
    requests: [{type: Schema.Types.ObjectId, ref: 'transaction'}],
    created: {
        type: Date,
        default: Date.now()
    }
});

mongoose.model('user', userSchema);