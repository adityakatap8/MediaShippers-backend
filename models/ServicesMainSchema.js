import mongoose from "mongoose";
const { Schema } = mongoose;

// Define the schema for Codec Settings
const CodecSettingsSchema = new Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    container: { type: String, required: true },
    videocodec: { type: String, required: true },
    size: { type: String, required: true },
    resolution: { type: String, required: true },
    framerate: { type: String, required: true },
    scantype: { type: String, required: true },
    vbitdepth: { type: String, required: true },
    chromasubsampling: { type: String, required: true },
    videobitrate: { type: String, required: true },
    HDR: { type: String, required: true },
    audiocodec: { type: String, required: true },
    samplerate: { type: String, required: true },
    abitdepth: { type: String, required: true },
    audiotrack: { type: String, required: true },
});

// Define the schema for Quality Check
const QualityCheckSchema = new Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    container: { type: String, required: true }, // Change fileFormat to container
    duration: { type: String, required: true },
    resolution: { type: String, required: true },
    bitrate: { type: String, required: true },
    audio: { type: String, required: true },
    visualQuality: { type: String, required: true },
    audioQuality: { type: String, required: true },
    issues: { type: [String], required: false },  // An array of potential issues found in the quality check
});

// Define the schema for File Transfer
const FileTransferSchema = new Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },  // Description field for extra info
});

// Define the schema for the main request body
const ServicesMainSchema = new Schema({
    services: [
        { 
            serviceType: { type: String, required: true },  // e.g., 'codec', 'qualityCheck', 'fileTransfer', etc.
            settings: { type: Schema.Types.Mixed, required: true }  // Service-specific data (codec settings, quality check, or file transfer)
        }
    ]
});

// Create the models from the schemas
const CodecSettings = mongoose.model("CodecSettings", CodecSettingsSchema);
const QualityCheck = mongoose.model("QualityCheck", QualityCheckSchema);
const FileTransfer = mongoose.model("FileTransfer", FileTransferSchema);
const ServicesMain = mongoose.model("ServicesMain", ServicesMainSchema);

export { CodecSettings, QualityCheck, FileTransfer, ServicesMain };

