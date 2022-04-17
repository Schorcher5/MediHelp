const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const prescriptionSchema = new Schema ({
  name: {type:String},
  use: {type:String},
  warning: {type:String},
  dosage: {type:String},
  avoid: {type:String},
  effects: {type:String}
}, {timestamps: true});

const Prescription = mongoose.model("Prescription", prescriptionSchema);
module.exports = Prescription;
