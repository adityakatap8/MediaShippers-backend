import { Organization } from '../models/orgModel.js';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import pkg from 'busboy';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const registerOrganizationWithUser = (req, res) => {
  const busboy = pkg({ headers: req.headers });
  const fields = {};
  const fileUrls = {};
  const uploads = [];

  busboy.on('field', (fieldname, val) => {
    fields[fieldname] = val;
  });

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    const key = `org-pdfs/${Date.now()}-${filename}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: mimetype,
    };
    const uploadPromise = s3.upload(params).promise()
      .then(data => {
        fileUrls[fieldname] = data.Location;
      });
    uploads.push(uploadPromise);
  });

  busboy.on('finish', async () => {
    try {
      await Promise.all(uploads);

      const {
        organizationId, // for selected org
        orgName,
        orgAddress,
        orgCorpRegNo,
        orgGstNo,
        primaryName,
        primaryEmail,
        primaryNo,
        userName,
        userEmail,
        role,
        password,
        createdBy
      } = fields;

      // Always validate user fields
      if (!primaryName || !primaryEmail || !primaryNo || !userName || !userEmail || !role || !password) {
        return res.status(400).json({ message: 'All required user fields must be provided' });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: userEmail });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      let organization;
      if (organizationId) {
        // Use existing organization
        organization = await Organization.findById(organizationId);
        if (!organization) {
          return res.status(404).json({ message: 'Selected organization not found' });
        }
      } else {
        // Validate org fields for new org
        if (!orgName || !orgAddress || !orgCorpRegNo || !orgGstNo) {
          return res.status(400).json({ message: 'All required organization fields must be provided' });
        }
        // Create new organization
        const newOrganization = new Organization({
          orgName,
          orgAddress,
          orgCorpRegNo,
          orgGstNo,
          primaryName,
          primaryEmail,
          primaryNo,
          orgCorpPdf: fileUrls.orgCorpPdf || '',
          orgGstPdf: fileUrls.orgGstPdf || '',
          orgAgreementPdf: fileUrls.orgAgreementPdf || ''
        });
        organization = await newOrganization.save();
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        name: userName,
        orgName: organization.orgName,
        email: userEmail,
        organizationId: organization._id,
        role,
        passwordHash,
        isVerified: false,
        verificationToken: uuidv4(),
        tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdBy
      });

      const savedUser = await newUser.save();

      return res.status(201).json({
        message: 'Organization and user registered successfully',
        organization: {
          id: organization._id,
          name: organization.orgName
        },
        user: {
          id: savedUser._id,
          email: savedUser.email,
          role: savedUser.role
        }
      });

    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ message: 'Internal server error', error: err.message });
    }
  });

  req.pipe(busboy);
};


export const getAllOrganizations = async (req, res) => {
  try {
    const organizations = await Organization.find();
    res.status(200).json({
      message: 'Organizations fetched successfully',
      organizations
    });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};


// import { Organization } from '../models/orgModel.js';
// import { User } from '../models/User.js';
// import bcrypt from 'bcrypt';
// import { v4 as uuidv4 } from 'uuid';

// export const registerOrganizationWithUser = async (req, res) => {
//   try {
//     const {
//       orgName,
//       userName,
//       role,
//       userEmail,
//       orgAddress,
//       orgCorpRegNo,
//       orgGstNo,
//       orgCorpPdf,
//       orgGstPdf,
//       orgAgreementPdf,
//       primaryName,
//       primaryEmail,
//       primaryNo,
//       password
//     } = req.body;

//     // Validate required fields
//     if (!orgName || !orgAddress || !orgCorpRegNo || !orgGstNo || !primaryName || !primaryEmail || !primaryNo || !password) {
//       return res.status(400).json({ message: 'All required fields must be provided' });
//     }

//     // Check if organization already exists
//     const existingOrg = await Organization.findOne({ orgName });
//     if (existingOrg) {
//       return res.status(400).json({ message: 'Organization already exists' });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ email: userEmail });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Create new organization
//     const newOrganization = new Organization({
//       orgName,
//       orgAddress,
//       orgCorpRegNo,
//       orgGstNo,
//       orgCorpPdf,
//       orgGstPdf,
//       orgAgreementPdf,
//       primaryName,
//       primaryEmail,
//       primaryNo
//     });

//     const savedOrganization = await newOrganization.save();

//     // Hash password
//     const salt = await bcrypt.genSalt(10);
//     const passwordHash = await bcrypt.hash(password, salt);

//     // Create new user
//     const newUser = new User({
//       name: userName,
//       orgName,
//       email: userEmail,
//       organizationId: savedOrganization._id,
//       role,
//       passwordHash,
//       isVerified: false,
//       verificationToken: uuidv4(),
//       tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
//     });

//     const savedUser = await newUser.save();

//     // Send verification email (you'll need to implement this)
//     // await sendVerificationEmail(savedUser.email, savedUser.verificationToken);

//     res.status(201).json({
//       message: 'Organization and user registered successfully',
//       organization: {
//         id: savedOrganization._id,
//         name: savedOrganization.orgName
//       },
//       user: {
//         id: savedUser._id,
//         email: savedUser.email,
//         role: savedUser.role
//       }
//     });

//   } catch (error) {
//     console.error('Registration error:', error);
//     res.status(500).json({ 
//       message: 'Error registering organization and user',
//       error: error.message 
//     });
//   }
// };