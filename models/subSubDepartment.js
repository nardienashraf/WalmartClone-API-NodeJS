const mongoose = require("mongoose");

const subSubDepartmentSchema = new mongoose.Schema({
  parentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "subDepartment",
    required: true,
  },
  name: {
    ar: {
      type: String,
      required: true,
    },
    en: {
      type: String,
      required: true,
    },
  },
});

const SubSubDepartmentModel = mongoose.model(
  "subSubDepartment",
  subSubDepartmentSchema
);

module.exports = SubSubDepartmentModel;
