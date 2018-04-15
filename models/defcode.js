const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create schema
const defCodeSchema = new Schema({
   defence_code: {
       type: String
   }
});

mongoose.model('def_code', defCodeSchema);