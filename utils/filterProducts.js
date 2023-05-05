const departmentModel = require("../models/departments");
const productModel = require("../models/products");
const SubDepartmentModel = require("../models/subDepartments");
const SubSubDepartmentModel = require("../models/subSubDepartment");

const filterProducts = async (query, numOfProducts) => {
  const { brand, minPrice, maxPrice, q, sortBy, sortOrder, page, limit } =
    query;
  const filters = {};
  if (brand) {
    filters["$or"] = [{ "brand.en": brand }, { "brand.ar": brand }];
  }
  if (minPrice) filters.priceAfter = { $gte: minPrice };
  if (maxPrice) filters.priceAfter = { $lte: maxPrice };
  if (q) {
    const departmentIds = await departmentModel
      .find({
        $or: [
          { "name.en": { $regex: q, $options: "i" } },
          { "name.ar": { $regex: q, $options: "i" } },
        ],
      })
      .distinct("_id");
    const subDepartmentIds = await SubDepartmentModel.find({
      $or: [
        { "name.en": { $regex: q, $options: "i" } },
        { "name.ar": { $regex: q, $options: "i" } },
      ],
    }).distinct("_id");
    const subSubDepartmentIds = await SubSubDepartmentModel.find({
      $or: [
        { "name.en": { $regex: q, $options: "i" } },
        { "name.ar": { $regex: q, $options: "i" } },
      ],
    }).distinct("_id");
    filters["$or"] = [
      { "name.en": { $regex: q, $options: "i" } },
      { "name.ar": { $regex: q, $options: "i" } },
      { departmentID: { $in: departmentIds } },
      { subDepartmentID: { $in: subDepartmentIds } },
      { nestedSubDepartment: { $in: subSubDepartmentIds } },
    ];
  }

  const sort = {};
  if (sortBy) sort[sortBy] = sortOrder === "desc" ? -1 : 1;

  const pageSize = parseInt(limit) || numOfProducts;
  const currentPage = parseInt(page) || 1;
  const skip = (currentPage - 1) * pageSize;
  const totalProducts = await productModel.countDocuments(filters);
  const totalPages = Math.ceil(totalProducts / pageSize);

  const products = await productModel
    .find(filters)
    .populate("sellerID", "businessName")
    .populate("departmentID", "name")
    .populate("subDepartmentID", "name")
    .populate("nestedSubDepartment", "name")
    .sort(sort)
    .skip(skip)
    .limit(pageSize);

  return {
    products,
    currentPage,
    totalPages,
    totalProducts,
  };
};

module.exports = { filterProducts };
