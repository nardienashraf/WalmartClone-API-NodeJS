const subSubDepartmentModel = require("../models/subSubDepartment");

//Get All SubDepartments
const getAllSubDeps = async (req, res, next) => {
  try {
    const subDepartments = await subSubDepartmentModel
      .find()
      .populate("parentID", "name");
    res.status(200).json(subDepartments);
  } catch (err) {
    res.json({ message: err.message });
  }
};

//Get All SubDepartments
const getSubDepsByParent = async (req, res, next) => {
  try {
    const { parentID } = req.params;
    const subDepartments = await subSubDepartmentModel
      .find({ parentID })
      .populate("parentID", "name");
    res.status(200).json(subDepartments);
  } catch (err) {
    res.json({ message: err.message });
  }
};
//Get subDepartment by id
const getSubDepById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const specificSubDep = await subSubDepartmentModel
      .findById(id)
      .populate("parentID", "name");
    res.status(200).json(specificSubDep);
  } catch (err) {
    res.json({ message: err.message });
  }
};

//Add new subDepartment
const AddnewSubDep = async (req, res, next) => {
  try {
    if (req.role === "admin") {
      const newSubDepartment = req.body;
      const addededSubDep = await subSubDepartmentModel.create(
        newSubDepartment
      );
      res.status(201).json(addededSubDep);
    } else {
      res.status(500).json("you not admin");
    }
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
};

//Update subDepartment
const updateSubDepById = async (req, res) => {
  try {
    if (req.role === "admin") {
      const id = req.params.id;
      const obj = req.body;
      let updatedSubDep = await subSubDepartmentModel.findByIdAndUpdate(
        id,
        obj,
        {
          new: true,
        }
      );
      res.json(updatedSubDep);
    } else {
      res.status(500).json("you not admin");
    }
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
};

//Delete SubDepartment
const deleteSubDepartment = async (req, res) => {
  try {
    if (req.role === "admin") {
      const id = req.params.id;
      await subSubDepartmentModel.findByIdAndDelete(id);
      res.json("sub-SubDepartment Deleted Successfully");
    } else {
      res.status(500).json("you not admin");
    }
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
};

module.exports = {
  AddnewSubDep,
  getSubDepsByParent,
  getAllSubDeps,
  getSubDepById,
  updateSubDepById,
  deleteSubDepartment,
};
