const express = require("express");
const {
  getAllSubDeps,
  getSubDepsByParent,
  AddnewSubDep,
  getSubDepById,
  updateSubDepById,
  deleteSubDepartment,
} = require("../controllers/subDepartments");
const auth = require("../middlewares/auth");

const router = express.Router();

//Get All SubDepartments
router.get("/", getAllSubDeps);

//Get All SubDepartments
router.get("/parentId/:parentID", getSubDepsByParent);

//Get subDepartment by id
router.get("/:id", getSubDepById);

//Add new SubDepartment
router.post("/", auth, AddnewSubDep);

//Update subDepartment
router.patch("/:id", auth, updateSubDepById);

//Delete subDepartment
router.delete("/:id", auth, deleteSubDepartment);

module.exports = router;
