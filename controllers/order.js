const orderModel = require("../models/orders");
const productModel = require("../models/products");
const sellerModel = require("../models/seller");

//TODO: add populate total and test
const getAllOrders = async (req, res, next) => {
  try {
    if (req.role === "admin") {
      const newOrder = await orderModel
        .find()
        .populate("customerID", "firstName email");
      // console.log(typeof newOrder);
      // for (const order of newOrder) {
      //   const totalPrice = await order.totalPrice;
      //   console.log(totalPrice);

      res.status(200).json(newOrder);
    } else {
      res.status(500).json({ message: `Only admin has access to here` });
    }
  } catch (err) {
    res.json({ message: err.message });
  }
};

//const getAllUserOrders = async (req, res, next) => {
//  try {
//    if (req.role === "customer") {
//      const order = await orderModel.find({ customerID: req.customer?._id })
//      // .populate("customerID", "firstName email");
//      // console.log(typeof newOrder);
//      // for (const order of newOrder) {
//      //   const totalPrice = await order.totalPrice;
//      //   console.log(totalPrice);
//      // }
//      res.status(200).json(order);
//    } else {
//      res.status(500).json({ message: `this is not your account` });
//    }
//  } catch (err) {
//    res.json({ message: err.message });
//  }
//};

const getAllUserOrders = async (req, res, next) => {
  try {
    if (req.role === "customer") {
      const orders = await orderModel
        .find({ customerID: req.customer?._id })
        .populate("items.product", "name priceAfter mainPhoto");

//      const populatedOrders = orders.map(order => {
//        const populatedItems = order.items.map(item => ({
//          ...item.toObject(),
//          product: item.product.toObject()
//        }));
//        return { ...order.toObject(), items: populatedItems };
//      });

      res.status(200).json(orders);
    } else {
      res.status(500).json({ message: `this is not your account` });
    }
  } catch (err) {
    res.json({ message: err.message });
  }
};

const getAllUserOrdersByID = async (req, res, next) => {
  try {
    if (req.role === "admin") {
      const { id } = req.params;
      const newOrder = await orderModel.find({ customerID: id });
      // .populate("customerID", "firstName email");
      // console.log(typeof newOrder);
      // for (const order of newOrder) {
      //   const totalPrice = await order.totalPrice;
      //   console.log(totalPrice);
      // }
      res.status(200).json(newOrder);
    } else {
      res.status(500).json({ message: `Only admin has access to here` });
    }
  } catch (err) {
    res.json({ message: err.message });
  }
};

const getOrderById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const specificOrder = await orderModel
      .findById(id)
      .populate("customerID", "firstName email");
    // .populate("items.product", "name priceAfter");
    // const totalPrice = await specificOrder.totalPrice;
    // res.status(200).json({ specificOrder, totalPrice });
    res.status(200).json(specificOrder);
  } catch (err) {
    res.json({ message: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    if (req.role == "customer") {
      const order = new orderModel({
        customerID: req.customer._id,
        ...req.body,
      });

      // Check if all products in the order have enough stock
      let allAvailable = true;
      for (const item of order.items) {
        const product = await productModel.findOne({ _id: item.product });
        if (product.quantity < item.quantity) {
          allAvailable = false;
          break;
        }
      }

      if (!allAvailable) {
        res.status(400).json({ error: "Out of stock" });
        return;
      }

      await order.save();

      // Update the Seller model for each item in the order
      for (const item of order.items) {
        try {
          const product = await productModel.findOne({ _id: item.product });
          await sellerModel.findByIdAndUpdate(
            product.sellerID,
            {
              $push: {
                orders: {
                  products: product._id,
                  parentOrder: order._id,
                  quantity: item.quantity,
                },
              },
            },
            { upsert: true }
          );
          const updatedStockQuantity = product.quantity - item.quantity;
          if (updatedStockQuantity === 0) {
            await productModel.findByIdAndUpdate(
              product._id,
              { quantity: updatedStockQuantity, isActive: false },
              { new: true }
            );
          } else {
            await productModel.findByIdAndUpdate(
              product._id,
              { quantity: updatedStockQuantity },
              { new: true }
            );
          }
        } catch (err) {
          console.error(err);
        }
      }
      res.status(201).send(order);
    } else {
      res.status(400).send("you are not a customer");
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    if (req.role == "admin") {
      // Find the order in the database and update its status
      const { id } = req.params;
      const obj = req.body;
      const updatedOrder = await orderModel.findByIdAndUpdate(id, obj, {
        new: true,
      });

      res.status(200).json(updatedOrder);
    } else {
      res.status(400).send(`Only admin has access to here`);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await orderModel.findById(id);
    if (
      req.role === "admin" ||
      (req.role === "customer" && order.customerID.equals(req.customer?._id))
    ) {
    }
    await orderModel.findByIdAndDelete(id);
    res.json("Order Deleted Successfully");
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
};

//-----------------------------------------//

module.exports = {
  getAllOrders,
  getAllUserOrders,
  getAllUserOrdersByID,
  createOrder,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
