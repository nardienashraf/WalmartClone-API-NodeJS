const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const reviewModel = require("./reviews");
const OrderModel = require("./orders");

const customerSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      minLength: 3,
      maxLength: 12,
      required: true,
    },
    lastName: {
      type: String,
      minLength: 3,
      maxLength: 12,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
          // return /^[a-zA-Z]{4,15}(@)(gmail|yahoo|outlook)(.com)$/.test(email);
        },
        message: (props) => `${props.value} is not a valid email`,
      },
    },
    // phone:{
    //     type:Number,
    //     validate:{
    //         validator: function(phone){
    //             return /^(012|011|010|015)[0-9]{8}$/.test(phone)
    //         },
    //         message: props =>`${props.value} is not a valid Phone Number`
    //     }
    // },
    password: {
      type: String,
      required: true,
      // validate: {
      //   validator: function (v) {
      //     return /^(?=.\d)(?=.[a-z])(?=.[A-Z])(?=.[!@#$%^&*]).{8,100}$/.test(v);
      //   },
      //   message: "Password not match",
      // },
    },
    // password: {
    //   type: String,
    //   required: true,
    // },
    address: [
      {
        _id: String,
        street: String,
        city: String,
        state: String,
        zip: String,
        firstName: String,
        lastName: String,
        phone: String,
        delivaryInstructions: String,
        isDefault: Boolean,
      },
    ],
    wallet: {
      type: Array,
    },
    lists: {
      favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "product" }],
    },
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
        quantity: { type: Number, default: 1 },
      },
    ],
    tokens: [{ type: Object }],
  },
  { timestamps: true }
);

//Middleware => before saving any document
customerSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      next();
      return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
  next();
});

customerSchema.methods.generateAuthToken = async function () {
  const customer = this;
  const token = jwt.sign({ _id: customer._id.toString() }, process.env.SECRET, {
    expiresIn: "15d",
  });
  customer.tokens = customer.tokens.concat({ token });
  await customer.save();
  return token;
};

// delete customer related data when account removed
customerSchema.pre("remove", async function (next) {
  const user = this;
  await reviewModel.deleteMany({ authorID: user._id });
  await OrderModel.deleteMany({ customerID: user._id });
  next();
});

const customerModel = mongoose.model("customer", customerSchema);
module.exports = customerModel;
