import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, "El Contenido Es Obligatorio"]
    },
    keeperUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true },
    keeperPost: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Post', 
        required: true },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,  
    versionKey: false   
});

export default mongoose.model("Comment", CommentSchema);
