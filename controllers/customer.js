const customerModel = require("../models/customer");
const bcrypt = require("bcrypt");
const shortid = require("shortid");
const productModel = require("../models/products");

//--------------------Login----------------------//

const customerLogin = async (req, res, next) => {
  try {
    const { email } = req.body;
    const customer = await customerModel.findOne({ email });
    if (customer) {
      res.status(201).send({ isFound: true });
      return;
    } else {
      res.status(201).send({ isFound: false });
      return;
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in customer: " + err.message);
  }
};

const checkPass = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await customerModel
      .findOne({ email })
      .populate("cart.product");
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      res.send(isMatch);
      return;
    }
    const token = await customer.generateAuthToken();
    res.json({ customer, token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error check password of customer: " + err.message);
  }
};

const AddnewCustomer = async (req, res, next) => {
  try {
    const customerData = req.body;
    const customer = await customerModel.create(customerData);
    // await customer.populate("cart.product").execPopulate();
    const token = await customer.generateAuthToken();
    res.status(201).json({ customer, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logoutCustomer = async (req, res) => {
  try {
    if (req.role === "customer") {
      req.customer.tokens = req.customer.tokens.filter((token) => {
        return token.token !== req.token;
      });
      await req.customer.save();
      res.send();
    } else {
      res.status(500).json("you not a customer");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const logoutAllDevices = async (req, res) => {
  try {
    if (req.role === "customer") {
      req.seller.tokens = [];
      await req.seller.save();
      res.send();
    } else {
      res.status(500).json("you not a customer");
    }
  } catch (error) {
    res.status(500).send(error);
  }
};
//-------------------CRUD-----------------------//

const getAllCustomers = async (req, res, next) => {
  try {
    if (req.role === "admin") {
      const customersEmail = await customerModel
        .find({})
        .populate("lists.favorites", "name")
        .populate("cart.product", "name");
      res.status(200).json(customersEmail);
    } else {
      res.status(500).json({ message: "Only admin can do that" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCustomerByEmail = async (req, res, next) => {
  try {
    const { email } = req.params;
    const customersEmail = await customerModel
      .find({ email })
      .populate("lists.favorites", "name")
      .populate("cart.product", "name");
    res.status(200).json(customersEmail);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const obj = req.body;
    if (req.role === "customer" && id.equals(req.customer._id)) {
      const updateFirstNameOfCustomer = await customerModel.findByIdAndUpdate(
        id,
        obj,
        { new: true }
      );
      res.status(200).json(updateFirstNameOfCustomer);
    } else {
      res.status(500).json({ message: `It's not your account` });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (
      (req.role === "customer" && id.equals(req.customer._id)) ||
      req.role === "admin"
    ) {
      await customerModel.deleteOne({ _id: id });
      res.status(200).json("Customer deleted successfully");
    } else {
      res.status(500).json({ message: `It's not your account` });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//-----------------Address-------------------------//
const addAddress = async (req, res) => {
  try {
    if (req.role === "customer") {
      const customer = req.customer;
      const address = req.body;

      // Generate a unique ID for the new address
      address._id = shortid.generate();

      customer.address.push(address);
      await customer.save();
      res.status(200).json({ message: "Address added successfully" });
    } else {
      res.status(500).json("you not a customer");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    if (req.role === "customer") {
      const customerId = req.customer._id;
      const addressId = req.params.addressId;

      const customer = await customerModel.findById(customerId);

      // Find the index of the address to be deleted
      const addressIndex = customer.address.findIndex(
        (address) => address._id.toString() === addressId
      );
      // If the address is not found, return a 404 Not Found response
      if (addressIndex === -1) {
        return res.status(404).json({ message: "Address not found" });
      }
      customer.address.splice(addressIndex, 1);
      await customer.save();

      res.status(200).json({ message: "Address deleted successfully" });
    } else {
      res.status(500).json("you not a customer");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
//------------------Favorites------------------------//
const addToFav = async (req, res, next) => {
  try {
    if (req.role === "customer") {
      const customer = req.customer;
      const product = await productModel.findById(req.params.productId);
      if (!product) {
        res.status(404).send("Product not found");
        return;
      }
      // check if item already added
      if (customer.lists.favorites.indexOf(product._id) === -1) {
        customer.lists.favorites.push(product._id);
        await customer.save();
      }
      res.status(200).json("product added");
    } else {
      res.status(500).json("you are not a customer");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteFromFav = async (req, res, next) => {
  try {
    if (req.role === "customer") {
      const customer = req.customer;
      const product = await productModel.findById(req.params.productId);
      if (!product) {
        res.status(404).send("Product not found");
        return;
      }
      // check if item not in fav
      if (customer.lists.favorites.indexOf(product._id) === -1) {
        return;
      }
      const productIndex = customer.lists.favorites.indexOf(product._id);
      customer.lists.favorites.splice(productIndex, 1);
      await customer.save();
      res.status(200).json("product deleted");
    } else {
      res.status(500).json("you are not a customer");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllFavProducts = async (req, res, next) => {
  try {
    if (req.role === "customer") {
      const customer = req.customer.populate("lists.favorites");
      res.json(customer.lists.favorites);
    } else {
      res.status(500).json("you are not a customer");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving favorite products: " + err.message);
  }
};

//------------------Cart------------------------//
const addToCart = async (req, res, next) => {
  try {
    if (req.role === "customer") {
      const { productId, quantity } = req.body;
      const customer = req.customer;

      // Check if the product is already in the cart
      console.log(customer.cart);
      const cartItem = customer.cart.find(
        (cartItem) => cartItem.product?.toString() === productId
      );

      if (cartItem) {
        cartItem.quantity += quantity;
      } else {
        customer.cart.push({ product: productId, quantity });
      }
      await customer.save();

      // Populate the product details for each item in the cart
      const cart = await Promise.all(
        customer.cart.map(async (cartItem) => {
          const product = await productModel.findById(cartItem.product);
          return {
            product: {
              _id: product._id,
              name: product.name,
              mainPhoto: product.mainPhoto,
              priceAfter: product.priceAfter,
            },
            quantity: cartItem.quantity,
            _id: cartItem._id,
          };
        })
      );

      res.status(200).json({
        message: "Product added to cart successfully",
        cart,
      });
    } else {
      res.status(500).json("you are not a customer");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCartItems = async (req, res, next) => {
  try {
    if (req.role === "customer") {
      const customer = req.customer;

      // Populate the product details for each item in the cart
      const cart = await Promise.all(
        customer.cart.map(async (cartItem) => {
          const product = await productModel.findById(cartItem.product);
          return {
            product: {
              _id: product._id,
              name: product.name,
              mainPhoto: product.mainPhoto,
              priceAfter: product.priceAfter,
            },
            quantity: cartItem.quantity,
            _id: cartItem._id,
          };
        })
      );
      res.status(200).json({ cart });
    } else {
      res.status(500).json("you are not a customer");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteFromCart = async (req, res, next) => {
  try {
    if (req.role === "customer") {
      const productId = req.params.productId;
      const customer = req.customer;

      const cartItemIndex = customer.cart.findIndex(
        (cartItem) => cartItem._id.toString() === productId
      );
      if (cartItemIndex === -1) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      customer.cart.splice(cartItemIndex, 1);
      await customer.save();

      // Populate the product details for each item in the cart
      const cart = await Promise.all(
        customer.cart.map(async (cartItem) => {
          const product = await productModel.findById(cartItem.product);
          return {
            product: {
              _id: product._id,
              name: product.name,
              mainPhoto: product.mainPhoto,
              priceAfter: product.priceAfter,
            },
            quantity: cartItem.quantity,
            _id: cartItem._id,
          };
        })
      );

      res.status(200).json({
        message: "Cart item deleted successfully",
        cart,
      });
    } else {
      res.status(500).json("you are not a customer");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAllFromCart = async (req, res) => {
  try {
    if (req.role === "customer") {
      const customer = req.customer;

      customer.cart = [];
      await customer.save();

      res.status(200).json({ message: "Cart cleared successfully" });
    } else {
      res.status(500).json("you are not a customer");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const editItemQnty = async (req, res, next) => {
  try {
    if (req.role === "customer") {
      const productId = req.params.productId;
      const customer = req.customer;
      const { quantity } = req.body;

      const cartItem = customer.cart.find(
        (cartItem) => cartItem._id.toString() === productId
      );
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      cartItem.quantity = quantity;
      await customer.save();

      // Populate the product details for each item in the cart
      const cart = await Promise.all(
        customer.cart.map(async (cartItem) => {
          const product = await productModel.findById(cartItem.product);
          return {
            product: {
              _id: product._id,
              name: product.name,
              mainPhoto: product.mainPhoto,
              priceAfter: product.priceAfter,
            },
            quantity: cartItem.quantity,
            _id: cartItem._id,
          };
        })
      );

      res.status(200).json({ message: "Cart item updated successfully", cart });
    } else {
      res.status(500).json("you are not a customer");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = {
  customerLogin,
  checkPass,
  AddnewCustomer,
  logoutCustomer,
  logoutAllDevices,
  getAllCustomers,
  getCustomerByEmail,
  updateCustomerById,
  deleteCustomerById,
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
};
