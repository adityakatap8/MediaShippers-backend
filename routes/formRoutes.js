// routes/formRoutes.js
import express from 'express';
import submitForm from '../controller/formController.js';  // ES6 import syntax

const router = express.Router();

// POST request to submit form data
router.post('/', submitForm);

export default router;
