const express = require("express");
const auth = require("../middlewares/auth");
const {
  getAllProductsApprove,
  setProductApprove,
} = require("../controllers/productToApproval");
const router = express.Router();

//Get All Products
router.get("/", auth, getAllProductsApprove);

// approve or not
router.post("/:id", auth, setProductApprove);

module.exports = router;
