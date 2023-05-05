const reviewModel = require("../models/reviews");

const createdReview = async (req, res, next) => {
  try {
    if (req.role === "customer") {
      const reviewToBeAdded = {
        authorID: req.customer._id,
        ...req.body,
      };
      const createdReview = await reviewModel.create(reviewToBeAdded);
      res.status(200).json(createdReview);
    } else {
      res.status(500).json("only customers can add reviews");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllReviews = async (req, res, next) => {
  try {
    const allReviews = await reviewModel
      .find()
      .populate("authorID", "firstName");
    res.status(200).json(allReviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllProductReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allProductReviews = await reviewModel
      .find({ productID: id })
      .populate("authorID", "firstName");
    res.status(200).json(allProductReviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllSellerReviews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allSellerReviews = await reviewModel
      .find({ sellerID: id })
      .populate("authorID", "firstName");
    res.status(200).json(allSellerReviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//TODO: complete this auth
const updatedReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await reviewModel.findById(id);
    if (req.role === "customer" && review.authorID.equals(req.customer._id)) {
      const obj = req.body;
      const updatedReview = await reviewModel.findByIdAndUpdate(id, obj, {
        new: true,
      });
      res.status(200).json(updatedReview);
    } else {
      res.status(500).json("only customers can add reviews");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletedReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await reviewModel.findById(id);
    if (req.role === "customer" && review.authorID.equals(req.customer._id)) {
      const deletedReview = await reviewModel.deleteOne({ _id: id });
      res.status(200).json("Review Deleted Successfully");
    } else {
      res.status(500).json("only customers can add reviews");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllProductReviews,
  getAllSellerReviews,
  createdReview,
  getAllReviews,
  updatedReview,
  deletedReview,
};
