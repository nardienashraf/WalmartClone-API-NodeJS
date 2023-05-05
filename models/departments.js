const mongoose = require("mongoose");

const departmentSchema = mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

const departmentModel = mongoose.model("department", departmentSchema);
module.exports = departmentModel;
