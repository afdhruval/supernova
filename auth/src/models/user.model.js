import mongoose from "mongoose";

const addressSchema = mongoose.Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
  country: String,
});

const userScahma = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    select: false
  },
  fullName: {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
  },
  role: {
    type: String,
    enum: ["user", "seller"],
    default: "user",
  },
  addresses: [addressSchema],
});

const userModel = mongoose.model("user", userScahma);

export default userModel;
