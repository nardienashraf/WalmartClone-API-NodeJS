const express = require("express");
const router = express.Router();
const {
  AddnewCustomer,
  checkPass,
  logoutCustomer,
  logoutAllDevices,
  getAllCustomers,
  getCustomerByEmail,
  updateCustomerById,
  deleteCustomerById,
  customerLogin,
  addAddress,
  deleteAddress,
  addToFav,
  deleteFromFav,
  getAllFavProducts,
  addToCart,
  getCartItems,
  deleteFromCart,
  deleteAllFromCart,
  editItemQnty,
} = require("../controllers/customer");
const auth = require("../middlewares/auth");
//--------------------Login----------------------//
//Customer login
router.post("/login", customerLogin);

// check the password
router.post("/signin", checkPass);

//To Create new Customer
router.post("/signup", AddnewCustomer);

// Logout a customer from this device
router.post("/logout", auth, logoutCustomer);

// Logout from all devices
router.post("/logoutAll", auth, logoutAllDevices);

//-------------------CRUD-----------------------//
//Get all customers
router.get("/", auth, getAllCustomers);

//Get sepcific customer by email
router.get("/email/:email", getCustomerByEmail);

//Update in any field of specific customer by Id
router.patch("/:id", auth, updateCustomerById);

//Delete specific customer by id
router.delete("/customerId/:id", auth, deleteCustomerById);

//-----------------Address-------------------------//
// add new address
router.post("/address", auth, addAddress);

// delete address
router.delete("/address/:addressId", auth, deleteAddress);

//------------------Favorites------------------------//
// adding favorite product
router.post("/favorites/:productId", auth, addToFav);

// deleting favorite product
router.delete("/favorites/:productId", auth, deleteFromFav);

//TODO: all lists // get from here or from customer itself
// retrieving favorite products
router.get("/favorites", auth, getAllFavProducts);

//------------------Cart------------------------//
// adding product to cart
router.post("/cart", auth, addToCart);

// get cart items
router.get("/cart", auth, getCartItems);

// deleting product from cart
router.delete("/cart/:productId", auth, deleteFromCart);

// deleting all product from cart
router.delete("/cart", auth, deleteAllFromCart);

// edit product quantity in cart
router.put("/cart/:productId", auth, editItemQnty);
module.exports = router;
