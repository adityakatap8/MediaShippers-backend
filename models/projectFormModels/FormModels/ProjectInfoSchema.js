import mongoose from 'mongoose';

const projectInfoSchema = new mongoose.Schema({
 
  projectTitle: {
    type: String,
    required: true
  },
  briefSynopsis: {
    type: String,
    
  },
  website: {
    type: String,
    
    match: /^(https?:\/\/)?(www\.)[a-zA-Z0-9-]+\.[a-zA-Z]{2,6}(\.[a-zA-Z]{2,6})?$/  // URL validation
  },
  email: {
    type: String,
    
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/  // Email validation
  }
}, {
  timestamps: true
});

const ProjectInfo = mongoose.model('ProjectInfo', projectInfoSchema);

export default ProjectInfo;
