const express = require("express");
const {
  getAllAdmins,
  AddnewAdmin,
  getAdminById,
  updateAdminById,
  deleteAdminById,
  loginAdmin,
} = require("../controllers/admin");
const router = express.Router();
const auth = require("../middlewares/auth");

// get all admins
router.get("/", auth, getAllAdmins);

// get admin by id
router.get("/:id", auth, getAdminById);

// add new admin
router.post("/", auth, AddnewAdmin);

// add new admin
router.post("/login", loginAdmin);

// update admin
router.patch("/:id", auth, updateAdminById);

// delete admin
router.delete("/:id", auth, deleteAdminById);

module.exports = router;
