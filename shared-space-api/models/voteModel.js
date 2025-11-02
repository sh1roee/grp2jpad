import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  voteID: { 
    type: String, 
    required: true, 
    unique: true 
  },
  //artwork sa artwork model
  artworkID: { 
    type: String, 
    required: true 
  }, 
  //user reference
  voterID: { 
    type: String, 
    required: true 
  }, 
  score: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 10 
  },
  selectedTags: { 
    type: [String], 
    default: [] 
  }
});

const Vote = mongoose.model("Vote", voteSchema);

export default Vote;
