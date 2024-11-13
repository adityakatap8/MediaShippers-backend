import mongoose, { Mongoose } from "mongoose";
import OrderType from "./OrderType";
import SourceType from "./SourceType";
import DestinationType from "./DestinationType";

const unifiedSchema = new Mongoose.Schema({

    OrderType: orderTypeSchema,
    SourceType: sourceTypeSchema,
    DestinationType: destinationTypeSchema
    
}) 

const unifiedTypeSchema = mongoose.model('UnifiedSchema', unifiedSchema);
export default unifiedTypeSchema;