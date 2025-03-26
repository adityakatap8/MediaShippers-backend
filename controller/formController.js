import nodemailer from 'nodemailer';
import FormData from '../models/FormModel.js';  // Ensure correct file path and extension

// Function to save form data and send email
const submitForm = async (req, res) => {
  const { name, email, organization, phone, selectedService, message } = req.body;

  // Save form data to the database
  const newForm = new FormData({ name, email, organization, phone, selectedService, message });

  try {
    // Save form data
    await newForm.save();

    // Create a transporter to send email using SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',  // Corrected SMTP host
      port: 587,  // Port for TLS
      secure: false,  // Use TLS
      auth: {
        user: 'aditya.katap@entertainmenttechnologists.com',  // Use environment variable for email
        pass: 'aftdxhtvnqunjpuh',  // Use environment variable for app password
      },
    });

    // Email options (content, recipient, etc.)
    const mailOptions = {
      from: process.env.SMTP_USER,  // Use SMTP_USER for the sender's email
      to: 'aditya.katap@entertainmenttechnologists.com',  // Recipient email
      subject: 'New Form Submission',
      text: `
        Name: ${name}
        Email: ${email}
        Organization: ${organization}
        Phone: ${phone}
        Selected Service: ${selectedService}
        Message: ${message}
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Return success response
    res.status(200).json({ message: 'Form submitted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error submitting form data or sending email' });
  }
};

// Export the submitForm function as default
export default submitForm;








// import nodemailer from 'nodemailer';
// import FormData from '../models/FormModel.js';

// // Function to save form data and send email
// const submitForm = async (req, res) => {
//   const { name, email, organization, phone, selectedService, message } = req.body;

//   // Save form data to the database
//   const newForm = new FormData({ name, email, organization, phone, selectedService, message });

//   try {
//     // Save form data
//     await newForm.save();

//     // Create a transporter to send email using SMTP
//     const transporter = nodemailer.createTransport({
//       host: 'smtp.gmail.com',
//       port: 587,
//       secure: false,
//       auth: {
//         user: 'aditya.katap@entertainmenttechnologists.com',
//         pass: 'aftdxhtvnqunjpuh',
//       },
//     });

//     // Email options (content, recipient, etc.)
//     const mailOptions = {
//       from: process.env.SMTP_USER,
//       to: 'aditya.katap@entertainmenttechnologists.com',
//       subject: 'New Form Submission',
//       text: `
//         Name: ${name}
//         Email: ${email}
//         Organization: ${organization}
//         Phone: ${phone}
//         Selected Service: ${selectedService}
//         Message: ${message}
//       `,
//     };

//     // Send the email to admin
//     await transporter.sendMail(mailOptions);

//     // Prepare email content for user
//     const userMailOptions = {
//       from: process.env.USER_EMAIL, // Replace with your email
//       to: email,
//       subject: 'Thank You for Submitting!',
//       html: `
//         <h2>Thank you for submitting your inquiry.</h2>
//         <p>We have received your form submission regarding ${selectedService}.</p>
//         <p>Your information has been saved and will be reviewed soon.</p>
//         <p><strong>Submission Details:</strong></p>
//         <ul>
//           <li>Name: ${name}</li>
//           <li>Email: ${email}</li>
//           <li>Organization: ${organization}</li>
//           <li>Phone: ${phone}</li>
//           <li>Selected Service: ${selectedService}</li>
//           <li>Message: ${message}</li>
//         </ul>
//         <p>We'll get back to you shortly with any next steps.</p>
//       `,
//     };

//     // Send email to user
//     await transporter.sendMail(userMailOptions);

//     // Return success response
//     res.status(200).json({ message: 'Form submitted successfully!' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error submitting form data or sending emails' });
//   }
// };

// // Export the submitForm function as default
// export default submitForm;
