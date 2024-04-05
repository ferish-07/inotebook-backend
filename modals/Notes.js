const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotesSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tag: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  user_name: {
    type: String,
  },
});

module.exports = mongoose.model("notes", NotesSchema);
