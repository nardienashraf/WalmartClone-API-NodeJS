const express = require("express");
const {
  getAllSubDeps,
  getSubDepsByParent,
  AddnewSubDep,
  getSubDepById,
  updateSubDepById,
  deleteSubDepartment,
} = require("../controllers/subSubDepartment");
const auth = require("../middlewares/auth");

const router = express.Router();

//Get All SubSubDepartments
router.get("/", getAllSubDeps);

//Get All SubDepartments
router.get("/parentId/:parentID", getSubDepsByParent);

//Get subSubDepartment by id
router.get("/:id", getSubDepById);

//Add new SubSubDepartment
router.post("/", auth, AddnewSubDep);

//Update subSubDepartment
router.patch("/:id", auth, updateSubDepById);

//Delete subSubDepartment
router.delete("/:id", auth, deleteSubDepartment);

module.exports = router;
