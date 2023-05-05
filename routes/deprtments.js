const express = require("express");
const {
  getAllDepartments,
  AddnewDep,
  getDepById,
  updateDepById,
  deleteDepartment,
} = require("../controllers/department");
const router = express.Router();
const auth = require("../middlewares/auth");

// get all departments
router.get("/", getAllDepartments);

// get department by id
router.get("/:id", getDepById);

// add new department
router.post("/", auth, AddnewDep);

// update department
router.patch("/:id", auth, updateDepById);

// delete department
router.delete("/:id", auth, deleteDepartment);

module.exports = router;
