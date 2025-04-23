import { Organization } from '../models/orgModel.js';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const registerOrganizationWithUser = async (req, res) => {
  try {
    const {
      orgName,
      userName,
      role,
      userEmail,
      orgAddress,
      orgCorpRegNo,
      orgGstNo,
      orgCorpPdf,
      orgGstPdf,
      orgAgreementPdf,
      primaryName,
      primaryEmail,
      primaryNo,
      password
    } = req.body;

    // Validate required fields
    if (!orgName || !orgAddress || !orgCorpRegNo || !orgGstNo || !primaryName || !primaryEmail || !primaryNo || !password) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if organization already exists
    // const existingOrg = await Organization.findOne({ orgName });
    // if (existingOrg) {
    //   return res.status(400).json({ message: 'Organization already exists' });
    // }

    // Check if user already exists
    const existingUser = await User.findOne({ email: userEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new organization
    const newOrganization = new Organization({
      orgName,
      orgAddress,
      orgCorpRegNo,
      orgGstNo,
      orgCorpPdf,
      orgGstPdf,
      orgAgreementPdf,
      primaryName,
      primaryEmail,
      primaryNo
    });

    const savedOrganization = await newOrganization.save();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name: userName,
      orgName,
      email: userEmail,
      organizationId: savedOrganization._id,
      role,
      passwordHash,
      isVerified: false,
      verificationToken: uuidv4(),
      tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    const savedUser = await newUser.save();

    // Send verification email (you'll need to implement this)
    // await sendVerificationEmail(savedUser.email, savedUser.verificationToken);

    res.status(201).json({
      message: 'Organization and user registered successfully',
      organization: {
        id: savedOrganization._id,
        name: savedOrganization.orgName
      },
      user: {
        id: savedUser._id,
        email: savedUser.email,
        role: savedUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error registering organization and user',
      error: error.message 
    });
  }
};