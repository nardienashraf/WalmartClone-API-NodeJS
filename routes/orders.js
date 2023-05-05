var express = require("express");
const {
  getAllOrders,
  getAllUserOrders,
  getAllUserOrdersByID,
  createOrder,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/order");
const auth = require("../middlewares/auth");

var router = express.Router();

// get all orders
router.get("/", auth, getAllOrders);

// get all user orders
router.get("/user", auth, getAllUserOrders);

// get all user orders by id
router.get("/user/:id", auth, getAllUserOrdersByID);

// get order by id
router.get("/:id", auth, getOrderById);

// Create a new order
router.post("/", auth, createOrder);

// add new order
// router.post("/", AddnewOrder);

// update order status
router.patch("/:id", auth, updateOrderStatus);

// delete order
router.delete("/:id", auth, deleteOrder);

module.exports = router;
