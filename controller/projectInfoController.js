import ProjectInfo from '../models/projectFormModels/FormModels/ProjectInfoSchema.js';  // Import the ProjectInfo model

// Controller function to create project info
export const createProjectInfo = async (req, res) => {
  const {
    projectTitle,
    projectName,
    briefSynopsis,
    website,
    email,
    twitter,
    facebook,
    instagram,
    posterFileName,  // Adjusted name
    bannerFileName,  // Adjusted name
    trailerFileName,  // Adjusted name
    movieFileName,  // Adjusted name
    srtFileName,     // Added field for SRT file
    infoDocFileName, // Added field for Info Document
    userId,
    // s3SourceBannerUrl,  // Adjusted name
    // s3SourceMovieUrl,  // Adjusted name
    // s3SourcePosterUrl,  // Adjusted name
    // s3SourceTrailerUrl  // Adjusted name
  } = req.body;

  // Validate required fields
  if (!projectTitle || !userId) {
    return res.status(400).json({ message: 'projectTitle and userId are required' });
  }

  // Validate email format (Optional: Could be in schema, but adding here for better control)
  if (email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // Create a new project with the provided data
    const newProject = new ProjectInfo({
      projectTitle,
      projectName,
      briefSynopsis,
      website,
      email,
      twitter,
      facebook,
      instagram,
      posterFileName,  // Adjusted name
      bannerFileName,  // Adjusted name
      trailerFileName,  // Adjusted name
      movieFileName,  // Adjusted name
      srtFileName,     // Added field for SRT file
      infoDocFileName, // Added field for Info Document
      userId
    });

    // Save the new project to the database
    await newProject.save();

    // Respond with success message and the created project data
    res.status(201).json({
      message: 'Project created successfully',
      project: newProject,
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Failed to create project', error });
  }
};

// Controller function to get project info by projectId
export const getProjectInfoByProjectName = async (req, res) => {
  const { userId } = req.params; // Assuming userId is passed as a URL parameter
  const projectName = req.cookies.projectName; // Get projectName from cookie

  if (!projectName) {
    return res.status(400).json({ message: 'Project name is required in cookie' });
  }

  try {
    // Find project by userId and projectName
    const project = await ProjectInfo.findOne({ userId, projectName });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ message: 'Failed to fetch project info', error });
  }
};

// Controller for PATCH request to update project info by projectName
export const updateProjectInfo = async (req, res) => {
  const { projectName } = req.params; // Get projectName from the route params
  const {
    briefSynopsis,
    website,
    email,
    twitter,
    facebook,
    instagram,
    posterFileName,  // Adjusted name
    bannerFileName,  // Adjusted name
    trailerFileName,  // Adjusted name
    movieFileName,  // Adjusted name
    srtFileName,     // Added field for SRT file
    infoDocFileName, // Added field for Info Document
  } = req.body;

  // Define the update data object, only include fields that are passed in the request body
  const updatedData = {};

  if (briefSynopsis) updatedData.briefSynopsis = briefSynopsis;
  if (website) updatedData.website = website;
  if (email) updatedData.email = email;
  if (twitter) updatedData.twitter = twitter;
  if (facebook) updatedData.facebook = facebook;
  if (instagram) updatedData.instagram = instagram;
  if (posterFileName) updatedData.posterFileName = posterFileName;
  if (bannerFileName) updatedData.bannerFileName = bannerFileName;
  if (trailerFileName) updatedData.trailerFileName = trailerFileName;
  if (movieFileName) updatedData.movieFileName = movieFileName;
  if (srtFileName) updatedData.srtFileName = srtFileName;    // Added field for SRT file
  if (infoDocFileName) updatedData.infoDocFileName = infoDocFileName; // Added field for Info Document

  try {
    // Find the project by projectName and update the fields
    const updatedProject = await ProjectInfo.findOneAndUpdate(
      { projectName }, // Find by projectName
      updatedData, // Update fields
      { new: true } // Return the updated project
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found with the provided name' });
    }

    // Respond with the updated project
    res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Error updating project info:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Controller function to delete project info by projectId
export const deleteProjectInfo = async (req, res) => {
  const { projectId } = req.params;

  try {
    const deletedProject = await ProjectInfo.findByIdAndDelete(projectId);
    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({
      message: 'Project deleted successfully',
      project: deletedProject,
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Failed to delete project', error });
  }
};
