const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//Create schema
const TransactionSchema = new Schema({
    op: {
        type: String,
    },
    err_code: {
       type: String
    },
    transfer_id: {
       type: String
    },
    msg: {
        type: String
    },
    amount: {
        type: Number
    },
    user: [{type: Schema.Types.ObjectId, ref: 'user'}],
    created: {
        type: Date,
        default: Date.now()
    }
  
});

mongoose.model('transaction', TransactionSchema);

