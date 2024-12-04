// models/formModel.js
import mongoose from 'mongoose';

const services = [
  'Delivery to OTT Streaming Platforms',
  'Delivery to Film Festivals',
  'Delivery to Censor Board',
  'Dubbing Services',
  'Subtitling Services',
  'QC and Compliance Services',
  'Distribution Services'
];

// Define schema for form data
const formSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  organization: { type: String, required: true },
  phone: { type: String, required: true },
  selectedService: {
    type: String,
    enum: services,  // Define valid options for selectedService
    required: true
  },
  message: { type: String, required: true },
}, { timestamps: true });

// Create a model for the form data
const FormData = mongoose.model('FormData', formSchema);

// Export the FormData model using ES6 export
export default FormData;
