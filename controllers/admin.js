const adminModel = require("../models/admin");
const bcrypt = require("bcrypt");
const { default: mongoose } = require("mongoose");

const getAllAdmins = async (req, res, next) => {
  try {
    if (req.role === "admin") {
      const newAdmin = await adminModel.find();
      res.status(200).json(newAdmin);
    } else {
      res.status(500).json("you not admin");
    }
  } catch (err) {
    res.json({ message: err.message });
  }
};

const loginAdmin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const admin = await adminModel.findOne({ email });
    if (!admin) {
      res.status(404).send("invalid password or email");
      return;
    }
    const valid = bcrypt.compareSync(password, admin.password);
    if (!valid) {
      res.status(404).send("invalid password or email");
      return;
    }
    const token = await admin.generateAuthToken();
    res.send({ admin, token });
  } catch (error) {
    res.status(400).send(error.message);
  }
};
const AddnewAdmin = async (req, res, next) => {
  try {
    if (req.role === "admin") {
      const admin = req.body;
      const savedAdmin = await adminModel.create(admin);
      const token = await savedAdmin.generateAuthToken();
      res.status(201).json({ savedAdmin, token });
    } else {
      res.status(500).json("you not admin");
    }
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
};

const getAdminById = async (req, res, next) => {
  try {
    if (req.role === "admin") {
      const { id } = req.params;
      const specificAdmin = await adminModel.findById(id);
      res.status(200).json(specificAdmin);
    } else {
      res.status(500).json("you not admin");
    }
  } catch (err) {
    res.json({ message: err.message });
  }
};

const updateAdminById = async (req, res) => {
  try {
    if (req.role === "admin" && req.admin._id.equals(req.params.id)) {
      const id = req.params.id;
      const obj = req.body;
      const updatedAdmin = await adminModel.findByIdAndUpdate(id, obj, {
        new: true,
      }); //new(options) if true, return the modified document rather than the original
      res.json(updatedAdmin);
    } else {
      res.status(500).json("you not admin");
    }
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
};

const deleteAdminById = async (req, res) => {
  try {
    if (req.role === "admin" && req.admin._id.equals(req.params.id)) {
      const id = req.params.id;
      await adminModel.findByIdAndDelete(id);
      res.json("Admin deleted successfully");
    } else {
      res.status(500).json("you not admin");
    }
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
};

module.exports = {
  AddnewAdmin,
  loginAdmin,
  getAllAdmins,
  getAdminById,
  updateAdminById,
  deleteAdminById,
};
