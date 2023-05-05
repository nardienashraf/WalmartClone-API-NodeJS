const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const productModel = require("./products");

var sellerSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      minLength: 3,
      maxLength: 15,
      required: true,
    },
    lastName: {
      type: String,
      minLength: 3,
      maxLength: 15,
      required: true,
    },
    businessName: {
      type: String,
    },
    businessEmail: {
      type: String,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          // return /^[a-zA-Z]{3,20}(@)(gmail|yahoo|outlook)(.com)$/.test(v);
        },
        message: (props) => {
          console.log(props);
          return `${props.value} is not a valid email !`;
        },
      },
    },
    businessPhone: {
      type: String,
      validator: function (v) {
        // regix for american number /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/
        //egyptian number
        return /^01[0-2]\s\d{1,8}$/.test(v);
      },
      message: (props) => {
        console.log(props);
        return `${props.value} is not a valid phone number !`;
      },
    },
    password: {
      type: String,
      required: true,
    },
    payments: {
      type: Array,
    },
    shipping: {
      type: Array,
    },
    badges: [{ type: String }],
    orders: [
      {
        products: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product",
          },
        ],
        timestamp: {
          type: Date,
          default: Date.now,
        },
        quantity: {
          type: Number,
        },
        status: {
          type: String,
          enum: ["Cancel", "Confirm"],
        },
        parentOrder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "order",
        },
      },
    ],
    tokens: [{ type: Object }],
  },
  { timestamps: true }
);

sellerSchema.methods.generateAuthToken = async function () {
  const seller = this;
  const token = jwt.sign({ _id: seller._id.toString() }, process.env.SECRET, {
    expiresIn: "15d",
  });
  seller.tokens = seller.tokens.concat({ token });
  await seller.save();
  return token;
};

sellerSchema.pre("save", async function (next) {
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
});

// delete seller products when account removed
sellerSchema.pre("remove", async function (next) {
  const user = this;
  await Product.deleteMany({ sellerID: user._id });
  next();
});

var sellerModel = mongoose.model("seller", sellerSchema);
module.exports = sellerModel;
