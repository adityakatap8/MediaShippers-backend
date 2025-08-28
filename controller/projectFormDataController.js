import mongoose from 'mongoose';
import ProjectFormViewerService from '../services/projectFormViewerService.js';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { deleteFolder, deleteFileFromUrl, deleteFile } from '../services/s3Service.js'

// Mongoose models
import ProjectForm from '../models/projectFormModels/ProjectForm.js';
import ProjectInfo from '../models/projectFormModels/FormModels/ProjectInfoSchema.js';

import CreditsInfo from '../models/projectFormModels/FormModels/CreditsInfoSchema.js';
import SpecificationsInfo from '../models/projectFormModels/FormModels/SpecificationsInfo.js';
import RightsInfoGroup from '../models/projectFormModels/FormModels/RightsInfoSchema.js';
import SrtInfoFileSet from '../models/projectFormModels/FormModels/SrtInfoFileSchema.js';




// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(file.mimetype);
  const mimetype = fileTypes.test(file.originalname.toLowerCase());

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: fileFilter,
});

// ✅ Fix: Define modelMap outside the controller methods
const modelMap = {
  project: ProjectInfo,
  srt: SrtInfoFileSet,
  specs: SpecificationsInfo,
  rights: RightsInfoGroup,
  credits: CreditsInfo,
};


const projectFormDataController = {
  // Fetch project form data
  getProjectFormData: async (req, res) => {
    const { id: projectId } = req.params;

    try {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      // Step 1: Fetch the ProjectInfo document directly
      const projectInfo = await ProjectInfo.findById(projectId);

      if (!projectInfo) {
        return res.status(404).json({ error: 'ProjectInfo not found' });
      }

      // Step 2: Fetch associated documents using IDs inside projectInfo
      const [creditsInfo, specificationsInfo, rightsInfo, srtInfo] = await Promise.all([
        CreditsInfo.findById(projectInfo.creditsInfoId),
        SpecificationsInfo.findById(projectInfo.specificationsInfoId),
        RightsInfoGroup.findById(projectInfo.rightsInfoId),
        SrtInfoFileSet.findById(projectInfo.srtFilesId),
      ]);

      // Step 3: Build response
      const responseData = {
        projectInfo,
        creditsInfo,
        specificationsInfo,
        rightsInfo,
        srtInfo,
      };

      res.json(responseData);
    } catch (error) {
      console.error('Error fetching project data:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  // getProjectFormData: async (req, res) => {
  //   const { id: projectId } = req.params;

  //   try {
  //     if (!mongoose.Types.ObjectId.isValid(projectId)) {
  //       return res.status(400).json({ error: 'Invalid ID format' });
  //     }

  //     const objectId = new mongoose.Types.ObjectId(projectId);

  //     // 🔍 First try to fetch from ProjectForm (single project upload flow)
  //     const projectForm = await ProjectForm.findOne({ projectInfo: objectId });

  //     if (projectForm) {
  //       // ✅ Fetch full project data from ProjectForm
  //       const projectInfo = await ProjectInfo.findById(projectForm.projectInfo);

  //       const [creditsInfo, specificationsInfo, rightsInfo, srtInfo] = await Promise.all([
  //         CreditsInfo.findById(projectForm.creditsInfo),
  //         SpecificationsInfo.findById(projectForm.specificationsInfo),
  //         RightsInfoGroup.findById(projectForm.rightsInfo?.[0]),
  //         SrtInfoFileSet.findById(projectInfo.srtFilesId),
  //       ]);

  //       const responseData = {
  //         projectForm: {
  //           ...projectForm.toObject(),
  //           creditsInfo,
  //           specificationsInfo,
  //           rightsInfo,
  //           srtInfo,
  //           projectInfo,
  //         },
  //       };

  //       return res.status(200).json(responseData);
  //     }

  //     // ❌ No ProjectForm → fallback to projectInfo directly (bulk upload case)
  //     const projectInfo = await ProjectInfo.findById(objectId);
  //     if (!projectInfo) {
  //       return res.status(404).json({ error: 'Project not found' });
  //     }

  //     const [creditsInfo, specificationsInfo, rightsInfo, srtInfo] = await Promise.all([
  //       CreditsInfo.findById(projectInfo.creditsInfoId),
  //       SpecificationsInfo.findById(projectInfo.specificationsInfoId),
  //       RightsInfoGroup.findById(projectInfo.rightsInfoId),
  //       SrtInfoFileSet.findById(projectInfo.srtFilesId),
  //     ]);

  //     const responseData = {
  //       projectForm: {
  //         ...projectInfo.toObject(), // mimic the structure of projectForm
  //         creditsInfo,
  //         specificationsInfo,
  //         rightsInfo,
  //         srtInfo,
  //       },
  //     };

  //     return res.status(200).json(responseData);
  //   } catch (error) {
  //     console.error('Error fetching project form data:', error.message);
  //     return res.status(500).json({ error: 'Internal server error' });
  //   }
  // }



  ,

  // updateMultipleSections: async (req, res) => {
  //   const { id: projectId } = req.params;
  //   const updateData = req.body;

  //   try {
  //     if (!mongoose.Types.ObjectId.isValid(projectId)) {
  //       return res.status(400).json({ error: 'Invalid project ID' });
  //     }

  //     if (!updateData || Object.keys(updateData).length === 0) {
  //       return res.status(400).json({ error: 'No update data provided.' });
  //     }

  //     const project = await ProjectInfo.findById(projectId);
  //     if (!project) {
  //       return res.status(404).json({ error: 'Project not found' });
  //     }

  //     const sectionsMap = {
  //       projectInfo: { model: ProjectInfo, id: project._id },
  //       creditsInfo: { model: CreditsInfo, id: project.creditsInfoId },
  //       rightsInfo: { model: RightsInfoGroup, id: project.rightsInfoId },
  //       specificationsInfo: { model: SpecificationsInfo, id: project.specificationsInfoId },
  //       srtInfo: { model: SrtInfoFileSet, id: project.srtFilesId },
  //     };

  //     const updateResults = {};
  //     console.log('🔄 Incoming update sections:', Object.keys(updateData));

  //     for (const [section, { model, id }] of Object.entries(sectionsMap)) {
  //       const sectionUpdate = updateData[section];
  //       if (sectionUpdate && id && mongoose.Types.ObjectId.isValid(id)) {
  //         const updatedDoc = await model.findByIdAndUpdate(id, sectionUpdate, { new: true }).exec();
  //         if (updatedDoc) {
  //           updateResults[section] = {
  //             id: updatedDoc._id,
  //             updatedData: updatedDoc,
  //           };
  //         }
  //       } else if (sectionUpdate) {
  //         console.warn(`⚠️ Skipping ${section} update due to missing or invalid ID`);
  //       }
  //     }

  //     const recognizedSections = Object.keys(sectionsMap);
  //     const extraSections = Object.keys(updateData).filter(k => !recognizedSections.includes(k));
  //     if (extraSections.length > 0) {
  //       console.warn('⚠️ Unrecognized sections in request body:', extraSections);
  //     }

  //     if (Object.keys(updateResults).length === 0) {
  //       return res.status(400).json({ message: 'No valid sections to update or invalid IDs.' });
  //     }

  //     return res.status(200).json({
  //       message: '✅ Project and related sections updated successfully',
  //       updates: updateResults,
  //     });

  //   } catch (error) {
  //     console.error('❌ Error updating project and sections:', error);
  //     return res.status(500).json({ error: 'Internal server error' });
  //   }
  // }

// updateMultipleSections: async (req, res) => {
//   const { id: projectId } = req.params;
//   const updateData = req.body;

//   // Helper: Normalize rights-related fields into a consistent rightsGroups structure
//   const normalizeRightsGroups = (project) => {
//     if (Array.isArray(project.rightsGroups) && project.rightsGroups.length > 0) {
//       return project.rightsGroups;
//     }

//     return [
//       {
//         rights: project.rights || [],
//         territories: project.territories || { includedRegions: [], excludeCountries: [] },
//         licenseTerm: project.licenseTerm || [],
//         usageRights: project.usageRights || [],
//         paymentTerms: project.paymentTerms || [],
//         platformType: project.platformType || [],
//         listPrice: project.listPrice || '',
//       },
//     ];
//   };

//   try {
//     if (!mongoose.Types.ObjectId.isValid(projectId)) {
//       return res.status(400).json({ error: 'Invalid project ID' });
//     }

//     if (!updateData || Object.keys(updateData).length === 0) {
//       return res.status(400).json({ error: 'No update data provided.' });
//     }

//     const project = await ProjectInfo.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ error: 'Project not found' });
//     }

//     const sectionsMap = {
//       projectInfo: { model: ProjectInfo, id: project._id },
//       creditsInfo: { model: CreditsInfo, id: project.creditsInfoId },
//       rightsInfo: { model: RightsInfoGroup, id: project.rightsInfoId },
//       specificationsInfo: { model: SpecificationsInfo, id: project.specificationsInfoId },
//       srtInfo: { model: SrtInfoFileSet, id: project.srtFilesId },
//     };

//     const updateResults = {};
//     console.log('🔄 Incoming update sections:', Object.keys(updateData));

//     // Update standard sections
//     for (const [section, { model, id }] of Object.entries(sectionsMap)) {
//       const sectionUpdate = updateData[section];
//       if (sectionUpdate && id && mongoose.Types.ObjectId.isValid(id)) {
//         const updatedDoc = await model.findByIdAndUpdate(id, sectionUpdate, { new: true }).exec();
//         if (updatedDoc) {
//           updateResults[section] = {
//             id: updatedDoc._id,
//             updatedData: updatedDoc,
//           };
//         }
//       } else if (sectionUpdate) {
//         console.warn(`⚠️ Skipping ${section} update due to missing or invalid ID`);
//       }
//     }

//     // ✅ NEW: Directly handle rightsGroups if sent
//     if (updateData.rightsGroups && Array.isArray(updateData.rightsGroups)) {
//       project.rightsGroups = updateData.rightsGroups;
//       await project.save();
//       updateResults['rightsGroups'] = {
//         id: project._id,
//         updatedData: project.rightsGroups,
//       };
//     } else {
//       // Fallback: Update individual rights-related fields if rightsGroups not provided
//       const isBulkUploaded = Array.isArray(project.rightsGroups) && project.rightsGroups.length > 0;
//       const fieldsToUpdate = [
//         'rights',
//         'territories',
//         'licenseTerm',
//         'usageRights',
//         'paymentTerms',
//         'platformType',
//         'listPrice',
//       ];

//       let updated = false;

//       if (isBulkUploaded) {
//         fieldsToUpdate.forEach((field) => {
//           if (updateData[field] !== undefined) {
//             project.rightsGroups[0][field] = updateData[field];
//             updated = true;
//           }
//         });

//         if (updated) {
//           await project.save();
//           updateResults['rightsGroups'] = {
//             id: project._id,
//             updatedData: project.rightsGroups[0],
//           };
//         }
//       } else {
//         fieldsToUpdate.forEach((field) => {
//           if (updateData[field] !== undefined) {
//             project[field] = updateData[field];
//             updated = true;
//           }
//         });

//         if (updated) {
//           await project.save();
//           updateResults['projectInfo'] = {
//             id: project._id,
//             updatedData: project,
//           };
//         }
//       }
//     }

//     // Normalize and ensure rightsGroups are consistent
//     project.rightsGroups = normalizeRightsGroups(project);

//     // Save normalized structure if changed
//     await project.save();

//     // Final result
//     updateResults['projectInfo'] = {
//       id: project._id,
//       updatedData: project,
//     };

//     // Handle extra (unrecognized) sections
//     const recognizedSections = Object.keys(sectionsMap);
//     const extraSections = Object.keys(updateData).filter(k => !recognizedSections.includes(k) && k !== 'rightsGroups');
//     if (extraSections.length > 0) {
//       console.warn('⚠️ Unrecognized sections in request body:', extraSections);
//     }

//     if (Object.keys(updateResults).length === 0) {
//       return res.status(400).json({ message: 'No valid sections to update or invalid IDs.' });
//     }

//     return res.status(200).json({
//       message: '✅ Project and related sections updated successfully',
//       updates: updateResults,
//     });

//   } catch (error) {
//     console.error('❌ Error updating project and sections:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// }

updateMultipleSections: async (req, res) => {
  const { id: projectId } = req.params;
  const updateData = req.body;

  try {
    // ✅ 1. Validate project ID and updateData
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No update data provided.' });
    }

    const project = await ProjectInfo.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // ✅ 2. Setup mapping for standard sections
    const sectionsMap = {
      projectInfo: { model: ProjectInfo, id: project._id },
      creditsInfo: { model: CreditsInfo, id: project.creditsInfoId },
      specificationsInfo: { model: SpecificationsInfo, id: project.specificationsInfoId },
      srtInfo: { model: SrtInfoFileSet, id: project.srtFilesId },
    };

    const updateResults = {};
    console.log('🔄 Incoming update sections:', Object.keys(updateData));

    // ✅ 3. Update standard sections
    for (const [section, { model, id }] of Object.entries(sectionsMap)) {
      const sectionUpdate = updateData[section];
      if (sectionUpdate && id && mongoose.Types.ObjectId.isValid(id)) {
        const updatedDoc = await model.findByIdAndUpdate(id, sectionUpdate, { new: true }).exec();
        if (updatedDoc) {
          updateResults[section] = {
            id: updatedDoc._id,
            updatedData: updatedDoc,
          };
        }
      } else if (sectionUpdate) {
        console.warn(`⚠️ Skipping ${section} update due to missing or invalid ID`);
      }
    }

    // ✅ 4. Load rightsInfo document
    const rightsInfo = project.rightsInfoId && mongoose.Types.ObjectId.isValid(project.rightsInfoId)
      ? await RightsInfoGroup.findById(project.rightsInfoId)
      : null;

    if (!rightsInfo) {
      console.warn('⚠️ rightsInfo not found for project.');
      return res.status(404).json({ error: 'Rights info not found' });
    }

    // ✅ 4.5 Check if this is a legacy single-upload document
    const isLegacySingleUpload = rightsInfo.rightsGroups === undefined && rightsInfo.rights !== undefined;
    console.log('🔍 Document type:', isLegacySingleUpload ? 'Legacy Single Upload' : 'Current Schema');

    const directRightsFields = [
      'rights',
      'usageRights',
      'licenseTerm',
      'paymentTerms',
      'platformType',
      'territories',
      'listPrice',
    ];

    const payloadIsBulk = updateData.rightsInfo?.rightsGroups?.length > 0;
    const hasDirectRightsFields = directRightsFields.some(field =>
      updateData.rightsInfo?.hasOwnProperty(field)
    );

    // ✅ 4.5 Debug: Log what we're receiving for rightsInfo
    if (updateData.rightsInfo) {
      console.log('📥 Received rightsInfo:', JSON.stringify(updateData.rightsInfo, null, 2));
      console.log('📥 Is bulk payload?', payloadIsBulk);
      console.log('📥 Has direct rights fields?', hasDirectRightsFields);
    }

    // ✅ 5. Handle legacy single-upload documents
    if (isLegacySingleUpload) {
      console.log('🔄 Processing legacy single-upload document');
      
      const updatedFields = {};
      let hasUpdates = false;

      for (const field of directRightsFields) {
        const newValue = updateData.rightsInfo[field];
        if (newValue !== undefined) {
          // For legacy documents, update top-level fields directly
          if (field === 'territories' && typeof newValue === 'object') {
            rightsInfo[field] = { ...newValue };
          } 
          else if (Array.isArray(newValue)) {
            rightsInfo[field] = [...newValue];
          } 
          else {
            rightsInfo[field] = newValue;
          }

          rightsInfo.markModified(field);
          updatedFields[field] = newValue;
          hasUpdates = true;
          console.log(`✅ Updated legacy rightsInfo.${field}:`, newValue);
        }
      }

      if (hasUpdates) {
        await rightsInfo.save();
        updateResults['rightsInfo'] = {
          id: rightsInfo._id,
          updatedData: updatedFields,
        };
        console.log('✅ Saved legacy single-upload rightsInfo updates');
      }
    }
    // ✅ 6. Bulk project update (current schema)
    else if (payloadIsBulk) {
      console.log('🔄 Processing bulk update (current schema)');
      rightsInfo.rightsGroups = updateData.rightsInfo.rightsGroups;
      rightsInfo.markModified('rightsGroups');
      await rightsInfo.save();

      updateResults['rightsGroups'] = {
        id: rightsInfo._id,
        updatedData: rightsInfo.rightsGroups,
      };
      console.log('✅ Updated bulk rightsGroups');
    }
    // ✅ 7. Single-upload update (current schema)
    else if (hasDirectRightsFields) {
      console.log('🔄 Processing single update (current schema)');
      
      // For current schema single updates, we need to update the first rightsGroup
      if (!rightsInfo.rightsGroups || rightsInfo.rightsGroups.length === 0) {
        rightsInfo.rightsGroups = [{}];
      }

      const updatedFields = {};
      let hasUpdates = false;

      for (const field of directRightsFields) {
        const newValue = updateData.rightsInfo[field];
        if (newValue !== undefined) {
          if (field === 'territories' && typeof newValue === 'object') {
            rightsInfo.rightsGroups[0][field] = { ...newValue };
          } 
          else if (Array.isArray(newValue)) {
            rightsInfo.rightsGroups[0][field] = [...newValue];
          } 
          else {
            rightsInfo.rightsGroups[0][field] = newValue;
          }

          rightsInfo.markModified('rightsGroups');
          updatedFields[field] = newValue;
          hasUpdates = true;
          console.log(`✅ Updated current schema rightsInfo.rightsGroups[0].${field}:`, newValue);
        }
      }

      if (hasUpdates) {
        await rightsInfo.save();
        updateResults['rightsInfo'] = {
          id: rightsInfo._id,
          updatedData: updatedFields,
        };
        console.log('✅ Saved current schema single-upload rightsInfo updates');
      }
    }

    // ✅ 8. Warn if any unknown fields present
    const recognizedSections = Object.keys(sectionsMap).concat(['rightsInfo']);
    const extraSections = Object.keys(updateData).filter(k => !recognizedSections.includes(k));
    if (extraSections.length > 0) {
      console.warn('⚠️ Unrecognized sections in request body:', extraSections);
    }

    // ✅ 9. Final response
    if (Object.keys(updateResults).length === 0) {
      return res.status(400).json({ message: 'No valid sections to update or invalid IDs.' });
    }

    return res.status(200).json({
      message: '✅ Project and related sections updated successfully',
      updates: updateResults,
    });

  } catch (error) {
    console.error('❌ Error updating project and sections:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
  ,





  // ✅ Controller function
  deleteProject: async (req, res) => {
    const { id: projectId } = req.params;
    const { orgName, projectName } = req.body;

    try {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID format' });
      }

      const project = await ProjectInfo.findById(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Prepare deletions for linked documents
      const deletions = [];

      if (project.creditsInfoId) {
        deletions.push(CreditsInfo.deleteOne({ _id: project.creditsInfoId }));
      }

      if (project.rightsInfoId) {
        deletions.push(RightsInfoGroup.deleteOne({ _id: project.rightsInfoId }));
      }

      if (project.specificationsInfoId) {
        deletions.push(SpecificationsInfo.deleteOne({ _id: project.specificationsInfoId }));
      }

      if (project.srtFilesId) {
        deletions.push(SrtInfoFileSet.deleteOne({ _id: project.srtFilesId }));
      }

      // Run all subdocument deletions in parallel
      await Promise.all(deletions);

      // Delete main project document
      const deleteResult = await ProjectInfo.deleteOne({ _id: projectId });
      if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ error: 'Project could not be deleted' });
      }

      // Delete S3 folder
      const folderPath = `${orgName}/${project.projectName}/`;
      console.log(`🗂️ Deleting S3 folder: ${folderPath}`);

      try {
        await deleteFolder(folderPath); // assumes this is defined elsewhere
        console.log(`✅ S3 folder deleted`);
      } catch (s3Error) {
        console.error(`❌ Failed to delete S3 folder: ${s3Error.message}`);
      }

      return res.status(200).json({ message: 'Project and all related data deleted successfully' });

    } catch (error) {
      console.error('❌ Error deleting project:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },


  deleteFileFromS3: async (req, res) => {
    try {
      const { fileUrl, filePath } = req.query;
      const bucketName = process.env.S3_BUCKET_NAME;

      if (!bucketName) {
        return res.status(500).json({
          error: 'S3_BUCKET_NAME is not configured in environment variables',
        });
      }

      let resolvedFilePath = '';

      if (filePath) {
        // Direct path input (safe to decode)
        resolvedFilePath = decodeURIComponent(filePath);
      } else if (fileUrl) {
        let urlObj;
        try {
          urlObj = new URL(fileUrl);
        } catch (e) {
          return res.status(400).json({ error: 'Invalid URL format' });
        }

        // ✅ Remove broken hostname validation – not reliable across regions or styles

        // 🔑 Extract and decode key (remove leading `/`)
        resolvedFilePath = decodeURIComponent(
          urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname
        );
      } else {
        return res.status(400).json({ error: 'Missing fileUrl or filePath query parameter' });
      }

      console.log('🧹 Deleting file from S3:', resolvedFilePath);

      // Actual S3 deletion (this must be defined elsewhere)
      await deleteFile(resolvedFilePath); // assumes AWS SDK deleteObject is used internally

      return res.status(200).json({ message: 'File deleted successfully from S3' });
    } catch (error) {
      console.error('❌ Error deleting file from S3:', error.message);
      return res.status(500).json({ error: 'Failed to delete file from S3: ' + error.message });
    }
  },






  // controllers/deleteFileMetadata.js
  deleteFileMetadata: async (req, res) => {
    try {
      const { id } = req.params;
      const { field, collection = 'project', fileId, index, extraField } = req.query;

      console.log('🧪 DELETE METADATA API CALLED');
      console.log('➡️ Collection:', collection);
      console.log('➡️ ID:', id);
      console.log('➡️ Field:', field);
      console.log('➡️ fileId:', fileId);
      console.log('➡️ index:', index);
      console.log('➡️ extraField:', extraField); // ✅ New log

      if (!id || !field) {
        return res.status(400).json({ error: 'Missing id or field' });
      }

      const Model = modelMap[collection];
      if (!Model) {
        return res.status(400).json({ error: `Unknown collection: ${collection}` });
      }

      const doc = await Model.findById(id);
      if (!doc) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // ✅ 1. Remove by array index
      if (typeof index !== 'undefined') {
        const fieldArray = doc[field];
        const idx = parseInt(index);

        if (!Array.isArray(fieldArray)) {
          return res.status(400).json({ error: `${field} is not an array` });
        }

        if (isNaN(idx) || idx < 0 || idx >= fieldArray.length) {
          return res.status(400).json({ error: 'Invalid index' });
        }

        const removed = fieldArray.splice(idx, 1);
        await doc.save();

        return res.status(200).json({
          message: 'Item removed from array by index',
          removed,
          updated: doc,
        });
      }

      // ✅ 2. Remove by fileId from array of objects
      if (fileId) {
        const update = { $pull: { [field]: { _id: fileId } } };

        const updated = await Model.findByIdAndUpdate(id, update, { new: true });
        if (!updated) {
          return res.status(404).json({ error: 'Document not found after update' });
        }

        return res.status(200).json({
          message: 'Item removed from array by fileId',
          updated,
        });
      }

      // ✅ 3. Skip $unset if field is an array (protect array fields)
      const currentValue = doc[field];
      if (Array.isArray(currentValue)) {
        return res.status(400).json({
          error: `Refusing to unset entire array field '${field}'. Provide fileId or index.`,
        });
      }

      // ✅ 4. Unset simple scalar field + optional extraField
      const unsetFields = { [field]: '' };
      if (extraField) {
        unsetFields[extraField] = '';
      }

      const updated = await Model.findByIdAndUpdate(
        id,
        { $unset: unsetFields },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Document not found after unset' });
      }

      return res.status(200).json({
        message: 'Simple field(s) unset',
        updated,
      });
    } catch (error) {
      console.error('❌ Metadata delete error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },


  // Handle file upload
  uploadProjectFile: upload.single('projectFile'),

  // Fetch only specifications info by project ID
  getSpecificationsInfo: async (req, res) => {
    const { id: projectId } = req.params;

    try {
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }

      const projectForm = await ProjectForm.findOne({ projectInfo: projectId }).select('specificationsInfo');

      if (!projectForm || !projectForm.specificationsInfo) {
        return res.status(404).json({ error: 'Specifications info not found' });
      }

      res.json(projectForm.specificationsInfo);
    } catch (error) {
      console.error('Error fetching specifications info:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get all projects with form data
  getAllProjectsWithFormData: async (req, res) => {
    try {
      const {
        userId,
        role,
        page = 1,
        limit = 48,
        rights,
        includingRegions,
        excludingCountries,
        usageRights,
        contentCategory,
        languages,
        genre,
        yearOfRelease,
        organizationIds
      } = req.query;

      console.log('🔍 Filtering projects with params:', {
        rights,
        includingRegions, excludingCountries, usageRights, contentCategory, languages, genre, yearOfRelease,
        userId,
        organizationIds
      })

      if (!userId || !role) {
        return res.status(400).json({ error: 'Missing userId or role in request query' });
      }

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      let baseMatch = {};
      if (role === 'Seller') {
        baseMatch.userId = userId;
      }

      // Build filter conditions
      const filterConditions = [];

      // RIGHTS
      // ...existing code...
      // RIGHTS
      if (rights) {
        // Normalize to array of lowercase rights
        const rightsArr = Array.isArray(rights)
          ? rights.map(r => r.toLowerCase())
          : [rights.toLowerCase()];

        filterConditions.push({
          $expr: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: {
                      $concatArrays: [
                        // Case A: nested rights from rightsInfoData.rightsGroups
                        {
                          $reduce: {
                            input: { $ifNull: ["$rightsInfoData", []] },
                            initialValue: [],
                            in: {
                              $concatArrays: [
                                "$$value",
                                {
                                  $reduce: {
                                    input: { $ifNull: ["$$this.rightsGroups", []] },
                                    initialValue: [],
                                    in: { $concatArrays: ["$$value", { $ifNull: ["$$this.rights", []] }] }
                                  }
                                }
                              ]
                            }
                          }
                        },
                        // Case B: flat rights at root
                        { $ifNull: ["$rights", []] }
                      ]
                    },
                    as: "right",
                    cond: {
                      $or: [
                        // Case 1: user searched only "all rights"
                        {
                          $and: [
                            { $eq: [rightsArr.length, 1] },
                            { $eq: [rightsArr[0], "all rights"] },
                            { $eq: [{ $toLower: "$$right.name" }, "all rights"] }
                          ]
                        },
                        // Case 2: otherwise match requested rights OR "all rights"
                        {
                          $and: [
                            { $not: { $and: [{ $eq: [rightsArr.length, 1] }, { $eq: [rightsArr[0], "all rights"] }] } },
                            {
                              $or: [
                                { $in: [{ $toLower: "$$right.name" }, rightsArr] },
                                { $eq: [{ $toLower: "$$right.name" }, "all rights"] }
                              ]
                            }
                          ]
                        }
                      ]
                    }
                  }
                }
              },
              0
            ]
          }
        });
      }



      // ...existing code...


      // INCLUDING REGIONS
      if (includingRegions) {
        const regions = Array.isArray(includingRegions)
          ? includingRegions
          : includingRegions.split(',');

        const regionsLower = regions.map(r => r.trim().toLowerCase());

        const isWorldwideOnly =
          regionsLower.length === 1 &&
          (regionsLower[0] === "worldwide" || regionsLower[0] === "world-wide");

        if (isWorldwideOnly) {
          filterConditions.push({
            $or: [
              { "rightsInfoData.rightsGroups.territories.includedRegions.id": { $regex: /^world(-)?wide$/i } },
              { "rightsInfoData.rightsGroups.territories.id": { $regex: /^world(-)?wide$/i } }
            ]
          });
        } else {
          const matchRegions = [...regionsLower, "worldwide", "world-wide"];

          filterConditions.push({
            $or: [
              {
                "rightsInfoData.rightsGroups.territories.includedRegions.id": {
                  $in: matchRegions.map(r => new RegExp(`^${r}$`, "i")),
                }
              },
              {
                "rightsInfoData.rightsGroups.territories.id": {
                  $in: matchRegions.map(r => new RegExp(`^${r}$`, "i")),
                }
              }
            ]
          });
        }
      }



      // EXCLUDING COUNTRIES
      if (excludingCountries) {
  const countries = Array.isArray(excludingCountries)
    ? excludingCountries
    : excludingCountries.split(',');

  // Use regex for case-insensitive match
  const regexCountries = countries.map(
    c => new RegExp(`^${c.trim()}$`, "i")
  );

  filterConditions.push({
    rightsInfoData: {
      $elemMatch: {
        rightsGroups: {
          $elemMatch: {
            "territories.excludeCountries": {
              $elemMatch: {
                name: { $in: regexCountries }
              }
            }
          }
        }
      }
    }
  });
}




      // USAGE RIGHTS
      if (usageRights) {
        // Normalize to array
        const usageArr = Array.isArray(usageRights) ? usageRights : usageRights.split(',');
        const usageRegexArr = usageArr.map(u => new RegExp(`^${u}$`, 'i')); // case-insensitive regex

        filterConditions.push({
          $or: [
            // Case A: usageRights inside rightsInfoData[].usageRights[]
            {
              rightsInfoData: {
                $elemMatch: {
                  usageRights: {
                    $elemMatch: { name: { $in: usageRegexArr } }
                  }
                }
              }
            },
            // Case B: usageRights inside rightsInfoData[].rightsGroups[].usageRights[]
            {
              rightsInfoData: {
                $elemMatch: {
                  rightsGroups: {
                    $elemMatch: {
                      usageRights: {
                        $elemMatch: { name: { $in: usageRegexArr } }
                      }
                    }
                  }
                }
              }
            },
            // (Optional legacy) Case C: usageRights directly at root
            {
              usageRights: { $elemMatch: { name: { $in: usageRegexArr } } }
            }
          ]
        });
      }




      // CONTENT CATEGORY
      if (contentCategory) {
        const categoryArr = Array.isArray(contentCategory) ? contentCategory : contentCategory.split(',');
        filterConditions.push({
          $or: categoryArr.map(c => {
            // Convert underscores to regex that matches space OR underscore
            const pattern = c.replace(/_/g, "[ _]");
            return {
              "specificationsInfoData.projectType": { $regex: new RegExp(pattern, "i") }
            };
          })
        });
      }


      // LANGUAGE
      if (languages) {
        const langArr = Array.isArray(languages) ? languages : languages.split(',');

        filterConditions.push({
          "specificationsInfoData.language": {
            $in: langArr.map(l => new RegExp(`^${l}$`, 'i')) // case-insensitive match
          }
        });
      }


      // GENRE
      if (genre) {
        const genreArr = Array.isArray(genre) ? genre : genre.split(',');
        const genreLower = genreArr.map(g => g.toLowerCase().trim());

        filterConditions.push({
          $expr: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: {
                      $reduce: {
                        input: {
                          $cond: [
                            { $isArray: "$specificationsInfoData.genres" },
                            "$specificationsInfoData.genres",
                            { $split: [{ $ifNull: ["$specificationsInfoData.genres", ""] }, ","] }
                          ]
                        },
                        initialValue: [],
                        in: {
                          $concatArrays: [
                            "$$value",
                            {
                              $cond: [
                                { $eq: [{ $type: "$$this" }, "string"] },
                                { $split: ["$$this", ","] }, // split string like "crime, thriller"
                                [
                                  {
                                    $cond: [
                                      { $eq: [{ $type: "$$this" }, "array"] },
                                      { $toString: { $first: "$$this" } }, // convert ["crime, thriller"] → "crime, thriller"
                                      "$$this"
                                    ]
                                  }
                                ]
                              ]
                            }
                          ]
                        }
                      }
                    },
                    as: "g",
                    cond: {
                      $in: [
                        {
                          $toLower: {
                            $trim: {
                              input: {
                                $cond: [
                                  { $eq: [{ $type: "$$g" }, "string"] },
                                  "$$g",
                                  { $toString: "$$g" } // fallback: force string
                                ]
                              }
                            }
                          }
                        },
                        genreLower
                      ]
                    }
                  }
                }
              },
              0
            ]
          }
        });
      }






      // YEAR OF RELEASE
      if (yearOfRelease) {
        const yearArr = Array.isArray(yearOfRelease) ? yearOfRelease : yearOfRelease.split(',');
        const yearNums = yearArr.map(y => parseInt(y));

        filterConditions.push({
          $expr: {
            $in: [
              {
                $year: {
                  $cond: [
                    { $isArray: "$specificationsInfoData.completionDate" },
                    { $arrayElemAt: ["$specificationsInfoData.completionDate", 0] }, // take first element
                    "$specificationsInfoData.completionDate"
                  ]
                }
              },
              yearNums
            ]
          }
        });
      }


      if (organizationIds && organizationIds.length > 0) {
        filterConditions.push({
          "userData.organizationId": {
            $in: organizationIds.map(id => id)
          }
        });
      }

      let matchStage = {};
      if (filterConditions.length > 0) {
        matchStage = { $and: filterConditions };
      }

      const pipeline = [];

      // Apply Seller restriction first
      if (Object.keys(baseMatch).length > 0) {
        pipeline.push({ $match: baseMatch });
      }

      pipeline.push(
        { $addFields: { userIdObj: { $toObjectId: "$userId" } } },
        {
          $lookup: {
            from: "specificationsinfos",
            localField: "specificationsInfoId",
            foreignField: "_id",
            as: "specificationsInfoData"
          }
        },
        {
          $lookup: {
            from: "rightsinfogroups",
            localField: "rightsInfoId",
            foreignField: "_id",
            as: "rightsInfoData"
          }
        },
        {
          $lookup: {
            from: "users",
            localField: "userIdObj",
            foreignField: "_id",
            as: "userData"
          }
        },
        { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } }
      );

      // Dynamic filters
      if (filterConditions.length > 0) {
        pipeline.push({ $match: { $and: filterConditions } });
      }

      // Pagination
      pipeline.push({
        $facet: {
          totalCount: [{ $count: "count" }],
          projects: [{ $skip: skip }, { $limit: limitNum }]
        }
      });

      const result = await ProjectInfo.aggregate(pipeline);

      const totalCount = result[0]?.totalCount[0]?.count || 0;
      const projects = result[0]?.projects || [];

      res.json({
        success: true,
        projects,
        totalPages: Math.ceil(totalCount / limitNum),
        currentPage: parseInt(page),
        totalCount
      });
    } catch (err) {
      console.error("Error fetching projects:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
};

export default projectFormDataController;
