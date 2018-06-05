const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//Create schema
const SessionSchema = new Schema({
   
    user: [{type: Schema.Types.ObjectId, ref: 'user'}],
    transactions: [{type: Schema.Types.ObjectId, ref: 'transaction'},
                    {date: Date, default: Date.now()}],    
    session_dc: String,
    session_balance: Number,
    created: {
        type: Date,
        default: Date.now()
    }
  
});

mongoose.model('session_balance', SessionSchema);