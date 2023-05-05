const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

var adminSchema = mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 8,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z]{3,20}(@)(gmail|yahoo|outlook)(.com)$/.test(v);
        },
        message: (props) => {
          console.log(props);
          return `${props.value} is not a valid email !`;
        },
      },
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      validator: {
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
    },
    role: {
      type: String,
      default: "Adminstrator",
    },
    tokens: [{ type: Object }],
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
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

adminSchema.methods.generateAuthToken = async function () {
  const admin = this;
  const token = jwt.sign({ _id: admin._id.toString() }, process.env.SECRET, {
    expiresIn: "15d",
  });
  admin.tokens = admin.tokens.concat({ token });
  await admin.save();
  return token;
};

var adminModel = mongoose.model("admin", adminSchema);
module.exports = adminModel;
