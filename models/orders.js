const mongoose = require("mongoose");
const productModel = require("../models/products");
const sellerModel = require("./seller");

const ordersSchema = mongoose.Schema(
  {
    // customerID: { type: mongoose.SchemaTypes.ObjectId }, // ID of the user who placed the order
    customerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "customer",
      required: true,
    },
    items: [
      // an array of items in the order
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// adding total price field
ordersSchema.virtual("totalPrice").get(async function () {
  let totalPrice = 0;
  for (const item of this.items) {
    const product = await productModel.findById(item.product);
    totalPrice += product.priceAfter * item.quantity;
  }
  return totalPrice;
});

const OrderModel = mongoose.model("order", ordersSchema);
module.exports = OrderModel;
