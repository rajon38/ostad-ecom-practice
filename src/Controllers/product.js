const Product =require("../models/product.js");
const fs =require("fs");
const slugify =require("slugify");
const braintree =require("braintree");
require("dotenv").config();
const Order =require("../models/order.js");


exports.create = async (req, res) => {
  try {
    console.log(req.fields);
    console.log(req.files);
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    console.log("PHOTO========>",photo)

    // validation
    switch (true) {
      case !name?.trim():
        return res.json({ error: "Name is required" });
      case !description?.trim():
        return res.json({ error: "Description is required" });
      case !price?.trim():
        return res.json({ error: "Price is required" });
      case !category?.trim():
        return res.json({ error: "Category is required" });
      case !quantity?.trim():
        return res.json({ error: "Quantity is required" });
      case !shipping?.trim():
        return res.json({ error: "Shipping is required" });
      case photo && photo.size > 1000000:
        return res.json({ error: "Image should be less than 1mb in size" });
    }

    // create product
    const product = new Product({ ...req.fields, slug: slugify(name) });

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

exports.list = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category")
      .select("-photo")
      .limit(12)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

exports.read = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .select("-photo")
      .populate("category");

    res.json(product);
  } catch (err) {
    console.log(err);
  }
};

exports.photo = async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId).select(
      "photo"
    );
    if (product.photo.data) {
      res.set("Content-Type", product.photo.contentType);
      res.set("Cross-Origin-Resource-Policy", "cross-origin")
      return res.send(product.photo.data);
    }
  } catch (err) {
    console.log(err);
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(
      req.params.productId
    ).select("-photo");
    res.json(product);
  } catch (err) {
    console.log(err);
  }
};

exports.update = async (req, res) => {
  try {
    // console.log(req.fields);
    // console.log(req.files);
    const { name, description, price, category, quantity, shipping } =
      req.fields;
    const { photo } = req.files;
    // console.log(req.params.productId)

    // option1
    // validation
    switch (true) {
      case !name?.trim():
      return  res.json({ error: "Name is required" });
      case !description?.trim():
      return  res.json({ error: "Description is required" });
      case !price?.trim():
      return  res.json({ error: "Price is required" });
      case !category?.trim():
      return  res.json({ error: "Category is required" });
      case !quantity?.trim():
      return  res.json({ error: "Quantity is required" });
      case !shipping?.trim():
      return  res.json({ error: "Shipping is required" });
      case photo && photo.size > 1000000:
      return  res.json({ error: "Image should be less than 1mb in size" });
    }

   

    // update product
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        ...req.fields,
        slug: slugify(name),
      },
      { new: true }
    );

    if (photo) {
      product.photo.data = fs.readFileSync(photo.path);
      product.photo.contentType = photo.type;
    }

    await product.save();
    res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(400).json(err.message);
  }
};

exports.filteredProducts = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    
    let args = {};
    if (checked.length > 0) args.category = checked
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    console.log("args => ", args);

    const products = await Product.find(args);
    console.log("filtered products query => ", products.length);
    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

exports.productsCount = async (req, res) => {
  try {
    const total = await Product.find({}).estimatedDocumentCount();
    res.json(total);
  } catch (err) {
    console.log(err);
  }
};

exports.listProducts = async (req, res) => {
  try {
    const perPage = 2;
    const page = req.params.page ? req.params.page : 1;

    const products = await Product.find({})
      .select("-photo")
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    console.log(err);
  }
};

exports.productsSearch = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await Product.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } }        
      ],
    }).select("-photo");

    res.json(results);
  } catch (err) {
    console.log(err);
  }
};

exports.relatedProducts = async (req, res) => {
  try {
    const { productId, categoryId } = req.params;
    
    const related = await Product.find({
      category: categoryId,
      _id: { $ne: productId },
    })
      .select("-photo")
      .populate("category")
      .limit(3);

    res.json(related);
  } catch (err) {
    console.log(err);
  }
};


