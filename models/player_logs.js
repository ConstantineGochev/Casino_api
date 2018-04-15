const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const PlayerLogsSchema = new Schema({
    op: {
        type: String
    },
    player_name: {
        type: String
    },
    player_balance: {
        type: Number
    },
    player_pass: {
        type: String
    },
    player_id: {
        type: String
    },
    created: {
        type: Date,
        default: Date.now()
    }
  
});

mongoose.model('player_logs', PlayerLogsSchema);