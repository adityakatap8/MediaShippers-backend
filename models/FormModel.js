// models/formModel.js
import mongoose from 'mongoose';  // ES6 import syntax

// Define schema for form data
const formSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  organization: { type: String, required: true },
  phone: { type: String, required: true },
  selectedService: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

// Create a model for the form data
const FormData = mongoose.model('FormData', formSchema);

// Export the FormData model using ES6 export
export default FormData;
