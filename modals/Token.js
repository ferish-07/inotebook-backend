const mongoose = require("mongoose");
const { Schema } = mongoose;

const tokenSchema = new Schema({
  token: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: "user", required: true },
  user_name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Token", tokenSchema);
