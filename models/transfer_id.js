const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create schema
const transferIDschema = new Schema({
   transfer_id: {
       type: String
   }
});

mongoose.model('transfer_id', transferIDschema);