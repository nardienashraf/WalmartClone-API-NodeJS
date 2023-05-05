const productModel = require("../models/products");
const productToApprovalModel = require("../models/productToApproval");

const getAllProductsApprove = async (req, res, next) => {
  try {
    if (req.role === "admin") {
      const products = await productToApprovalModel.find().populate("sellerID", "businessName")
      res.status(200).json(products);
    } else {
      res.status(400).json("only admin can access");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const setProductApprove = async (req, res, next) => {
  try {
    if (req.role === "admin") {
      const { response } = req.body;
      if (response !== "Approve" && response !== "Delete") {
        return res
          .status(404)
          .json("'Approve' and 'Delete' only allowed response");
      }
      const productId = req.params.id;
      if (response === "Approve") {
        const product = await productToApprovalModel.findById(productId);
        console.log(product);
        const newProduct = { ...product.toObject(), _id: undefined };
        console.log(newProduct);
        await productModel.create(newProduct);
        console.log(1);
      }
      console.log(2);

      await productToApprovalModel.findByIdAndDelete(productId);
      console.log(3);
      res.status(200).json("product approval updated");
    } else {
      res.status(400).json("only admin can access");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllProductsApprove,
  setProductApprove,
};
