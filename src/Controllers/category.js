const Category = require("../Models/category");
const Product = require("../Models/product");
const slugify = require("slugify");

exports.create = async (req,res) => {
    try{
        const { name } = req.body;
        if(!name.trim()){
            return res.json({error: "Name is required"});
        }
        const existingCategory = await Category.findOne({name});
        if (existingCategory){
            return res.json({error: "Already Exists"});
        }

        const category = await new Category({name, slug: slugify(name)}).save();
        res.json(category);
    }catch (err){
        console.log(err);
        return res.status(400).json(err)
    }
}

exports.update = async (req, res) => {
    try {
        const { name } = req.body;
        const { categoryId } = req.params;
        const category = await Category.findByIdAndUpdate(
            categoryId,
            {
                name,
                slug: slugify(name)
            },
            { new: true }
        );
        res.json(category);
    } catch (err) {
        console.log(err);
        return res.status(400).json(err.message);
    }
};

exports.remove = async (req,res) => {
    try {
        await Category.findByIdAndDelete(req.params.categoryId);
        res.json({status:"Success", message: "category deleted"});
    }catch (err){
        console.log(err);
        res.status(400).json(err);
    }
}

exports.list = async (req,res) => {
    try{
        const all = await Category.find({});
        res.json(all);
    }catch (err){
        console.log(err);
        return res.status(400).json(err)
    }
}

exports.read = async (req,res) => {
    try {
        const category = await Category.findOne({ slug: req.params.slug });
        res.json(category);
    }catch (err){
        console.log(err);
        return res.status(400).json(err)
    }
}

exports.productByCategory = async (req, res) => {
    try {
        const category = await Category.findOne({slug: req.params.slug});
        const products = await Product.find({category}).populate("category");
        res.json({
            category,
            products
        })
    }catch (err){
        console.log(err);
        res.status(400).json(err)
    }
}