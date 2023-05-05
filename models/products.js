const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      ar: {
        type: String,
      },
      en: {
        type: String,
      },
    },
    priceBefore: Number,
    priceAfter: { type: Number, required: true },
    brand: {
      ar: {
        type: String,
      },
      en: {
        type: String,
      },
    },
    quantity: {
      type: Number,
      required: true,
    },
    variety: {
      colors: {
        ar: [String],
        en: [String],
      },
      sizes: {
        ar: [String],
        en: [String],
      },
    },
    photos: [
      {
        type: String,
      },
    ],
    mainPhoto: { type: String },
    badges: {
      ar: [String],
      en: [String],
    },
    productDetails: {
      ar: { type: String },
      en: { type: String },
    },
    specifications: [
      {
        ar: { type: String },
        en: { type: String },
      },
    ],
    warranty: {
      ar: { type: String },
      en: { type: String },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    departmentID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "department",
      required: true,
    },
    subDepartmentID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "subDepartment",
      required: true,
    },
    nestedSubDepartment: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "subSubDepartment",
      required: true,
    },
    sellerID: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "seller",
      required: true,
    },
  },
  { timestamps: true }
);

// delete product reviews when product removed
productSchema.pre("remove", async function (next) {
  const product = this;
  await Review.deleteMany({ productID: product._id });
  next();
});

const productModel = mongoose.model("product", productSchema);
module.exports = productModel;
