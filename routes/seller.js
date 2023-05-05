var express = require("express");
var {
  getAllSellers,
  AddnewSeller,
  getSellerById,
  updateSellerById,
  deleteSeller,
  loginSeller,
  getSellerOrders,
  confirmOrderStatus,
} = require("../controllers/seller");
const auth = require("../middlewares/auth");

var router = express.Router();

// get all sellers
router.get("/", auth, getAllSellers);

// Get seller by id
router.get("/sellerid/:id", getSellerById);

// Login a seller
router.post("/login", loginSeller);

// add new seller
router.post("/", AddnewSeller);

// Update seller
router.patch("/:id", auth, updateSellerById);

// Delete Seller
router.delete("/:id", auth, deleteSeller);

//-----------------------------------//

router.get("/orders", auth, getSellerOrders);

router.put("/orders/:id", auth, confirmOrderStatus);

module.exports = router;
