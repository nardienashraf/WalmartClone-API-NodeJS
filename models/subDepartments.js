const mongoose = require("mongoose");

const subDepartmentSchema = new mongoose.Schema({
  parentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "department",
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

const SubDepartmentModel = mongoose.model("subDepartment", subDepartmentSchema);

module.exports = SubDepartmentModel;
