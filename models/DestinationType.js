import mongoose from "mongoose";

const destinationTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

const DestinationType = mongoose.model('DestinationType', destinationTypeSchema);
export default DestinationType;
