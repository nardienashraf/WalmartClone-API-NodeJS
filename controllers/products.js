const productModel = require("../models/products");
const productToApprovalModel = require("../models/productToApproval");
const cloudinary = require("cloudinary");

const { filterProducts } = require("../utils/filterProducts");

//TODO: admin confirmation first
const addProduct = async (req, res, next) => {
  try {
    if (req.role === "seller" || req.role === "admin") {
      const product =
        req.role === "admin"
          ? new productModel({
              ...req.body,
              sellerID: process.env.WALMART_SELLER_ID,
            })
          : new productToApprovalModel({
              ...req.body,
              sellerID: req.seller._id,
            });

      // adding photos to cloudinary
      if (req.files && req.files.photos) {
        const files = Array.isArray(req.files.photos)
          ? req.files.photos
          : [req.files.photos];
        const urls = [];

        for (const file of files) {
          const result = await cloudinary.uploader.upload(file.tempFilePath, {
            public_id: `${Date.now()}`,
            resource_type: "auto",
            folder: "images",
          });
          urls.push(result.url);
        }
        product.photos = urls;
        product.mainPhoto = product.photos[0];
      }

      const result = await product.save();
      res.status(201).json(result);
    } else {
      res.status(500).json({ error: "create seller account" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

//for admin dashboard
const getAllProducts = async (req, res, next) => {
  try {
    if (req.role === "admin") {
      const filteredProducts = await filterProducts(req.query, 100);
      res.status(200).json(filteredProducts);
    } else {
      res.status(400).json("only admin can access");
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//for users website
const getAllActiveProducts = async (req, res, next) => {
  try {
    const filteredProducts = await filterProducts(req.query, 20);
    res.status(200).json(filteredProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//for seller and admin
const changeProductActivity = async (req, res, next) => {
  try {
    if (req.role === "seller" || req.role === "admin") {
      const productId = req.params.id;
      const { isActive } = req.body;
      const theproduct = await productModel.findById(productId);
      if (
        req.role === "admin" &&
        theproduct.sellerID.equals(process.env.WALMART_SELLER_ID)
      ) {
        const product = await productModel.findByIdAndUpdate(
          productId,
          { isActive },
          { new: true }
        );
        res.status(200).json(product);
      } else if (req.seller._id.equals(theproduct.sellerID)) {
        const product = await productModel.findByIdAndUpdate(
          productId,
          { isActive },
          { new: true }
        );
        res.status(200).json(product);
      } else {
        res.json("you are not the product owner");
      }
    } else {
      res.status(500).json({ error: "create seller account" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProductByID = async (req, res, next) => {
  try {
    const products = await productModel.findById(req.params.id);
    // .populate("sellerID", "businessName")
    // .populate("departmentID", "name")
    // .populate("subDepartmentID", "name")
    // .populate("nestedSubDepartment", "name");
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// for seller dashboard
const getProductBySeller = async (req, res, next) => {
  try {
    if (req.role === "admin" || req.role === "seller") {
      const products = await productModel.find({
        sellerID: req.seller?._id || process.env.WALMART_SELLER_ID,
      });
      // .populate("sellerID", "businessName")
      // .populate("departmentID", "name")
      // .populate("subDepartmentID", "name")
      // .populate("nestedSubDepartment", "name")
      res.status(200).json(products);
    } else {
      res.status(500).json({ error: "create seller account" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//for users website
const getActiveProductBySeller = async (req, res, next) => {
  try {
    const products = await productModel.find({
      sellerID: req.params.id,
      isActive: true,
    });
    // .populate("sellerID", "businessName")
    // .populate("departmentID", "name")
    // .populate("subDepartmentID", "name")
    // .populate("nestedSubDepartment", "name")
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get products by department
const getProductByDept = async (req, res, next) => {
  try {
    const { brand, minPrice, maxPrice, name, sortBy, sortOrder, page, limit } =
      req.query;

    const filters = {
      $or: [
        { departmentID: req.params.id },
        { subDepartmentID: req.params.id },
        { nestedSubDepartment: req.params.id },
      ],
      isActive: true,
    };
    if (brand) filters.brand = brand;
    if (minPrice) filters.priceAfter = { $gte: minPrice };
    if (maxPrice) filters.priceAfter = { $gte: maxPrice };
    if (name) filters.name = { $regex: name, $options: "i" };

    const sort = {};
    if (sortBy) sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const pageSize = parseInt(limit) || 10;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * pageSize;

    const totalProducts = await productModel.countDocuments(filters);
    const totalPages = Math.ceil(totalProducts / pageSize);

    const products = await productModel
      .find(filters)
      // .populate("sellerID", "businessName")
      // .populate("departmentID", "name")
      // .populate("subDepartmentID", "name")
      // .populate("nestedSubDepartment", "name")
      .sort(sort)
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      products,
      currentPage,
      totalPages,
      totalProducts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err });
  }
};

const updateProdudtByID = async (req, res, next) => {
  try {
    const { id } = req.params;
    const theProduct = await productModel.findById(id);

    if (
      (req.role === "admin" &&
        theProduct.sellerID.equals(process.env.WALMART_SELLER_ID)) ||
      (req.role === "seller" && theProduct.sellerID.equals(req.seller._id))
    ) {
      const obj = req.body;
      const updatedProduct = await productModel.findByIdAndUpdate(id, obj, {
        new: true,
      });

      // adding photos to cloudinary
      if (req.files && req.files.photos) {
        const files = Array.isArray(req.files.photos)
          ? req.files.photos
          : [req.files.photos];
        const urls = [];

        for (const file of files) {
          const result = await cloudinary.uploader.upload(file.tempFilePath, {
            public_id: `${Date.now()}`,
            resource_type: "auto",
            folder: "images",
          });
          urls.push(result.url);
        }
        product.photos = urls;
        product.mainPhoto = product.photos[0];
      }

      await product.save();

      res.status(200).json(updatedProduct);
    } else {
      res.status(500).json({ message: "you are not product owner " });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProductByID = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id);
    const product = await productModel.findById(id);
    console.log(product);
    console.log(product.sellerID, req.seller);
    // if (
    //   (req.role === "admin" &&
    //     product.sellerID.equals(process.env.WALMART_SELLER_ID)) ||
    //   (req.role === "seller" && product.sellerID.equals(req.seller?._id))
    // ) {
    if (
      req.role === "admin" ||
      (req.role === "seller" && product.sellerID.equals(req.seller?._id))
    ) {
      await productModel.deleteOne({ _id: id });
      res.status(200).json("Product deleted successfully");
    } else {
      res.status(500).json({ message: "you are not product owner " });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getAllActiveProducts,
  changeProductActivity,
  getProductByID,
  getProductBySeller,
  getActiveProductBySeller,
  getProductByDept,
  updateProdudtByID,
  deleteProductByID,
};
