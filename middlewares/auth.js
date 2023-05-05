const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const Customer = require("../models/customer");
const Seller = require("../models/seller");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.SECRET);
    const [userIsAdmin, userIsSeller, userIsCustomer] = await Promise.all([
      Admin.findOne({ _id: decoded._id, "tokens.token": token }),
      Seller.findOne({ _id: decoded._id, "tokens.token": token }),
      Customer.findOne({ _id: decoded._id, "tokens.token": token }),
    ]);

    switch (true) {
      case Boolean(userIsAdmin):
        req.admin = userIsAdmin;
        req.role = "admin";
        break;
      case Boolean(userIsSeller):
        req.seller = userIsSeller;
        req.role = "seller";
        break;
      case Boolean(userIsCustomer):
        req.customer = userIsCustomer;
        req.role = "customer";
        break;
      default:
        throw new Error();
    }

    req.token = token;
    next();
  } catch (err) {
    res.status(401).send({ error: "Please Login first" });
  }
};

module.exports = auth;
