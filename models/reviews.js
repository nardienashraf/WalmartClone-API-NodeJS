const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    sellerID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "seller",
    },
    productID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
    },
    authorID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "customer",
    },
    // rating: Number,
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: String,
    // likes: Number,
    // likesArray: Array,
    // dislikes: Number,
    // dislikesArray: Array,
    liked: {
      type: Number,
      default: 0,
    },
    likedArray: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer",
      },
    ],
    disLiked: {
      type: Number,
      default: 0,
    },
    disLikedArray: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer",
      },
    ],
  },
  { timestamps: true }
);

const reviewModel = mongoose.model("review", reviewSchema);
module.exports = reviewModel;
