const User = require("../Models/user");
const {hashPassword, comparePassword} = require("../Helpers/auth");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Order = require("../Models/order");

exports.register = async (req, res) => {
    try{
        const { name, email, password } =req.body;

        //validation
        if(!name.trim()){
            return res.json({error: "Name is required"});
        }
        if(!email){
            return res.json({error: "Email is required"});
        }
        if(!password || password.length<6){
            return res.json({error: "Password must be at least 6 characters long"});
        }

        //check email
        const existingUser = await User.findOne({ email });
        if (existingUser){
            return res.json({error: "Email is taken"});
        }
        //hash password
        const hashedPassword = await hashPassword(password);
        //register user
        const user = await new User({
            name,
            email,
            password: hashedPassword
        }).save();

        //create jwt token
        const token = jwt.sign({_id: user._id}, process.env.JWT_TOKEN,{expiresIn: "7d"});
        //send response
        res.json({
            user:{
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address
            },
            token
        });
    }catch (err){
        console.log(err);
    }
}

exports.login = async (req,res) => {
    try{
        const { email,password } = req.body;
        if(!email){
            return res.json({error: "Email not found"});
        }
        if(!password || password.length<6){
            return res.json({error: "password is incorrect"});
        }
        const user = await User.findOne({email});
        if (!user){
            return res.json({error: "User not found"});
        }

        //compare password
        const match = await comparePassword(password, user.password);
        if (!match){
            return res.json({error: "Wrong password"});
        }

        //create signed jwt
        const token = jwt.sign({_id:user._id}, process.env.JWT_TOKEN,{
            expiresIn: "7d"
        });

        //send respose
        res.json({
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address
            },
            token
        });
    }catch (err) {
        console.log(err);
    }
}

exports.secret = async (req,res) => {
    res.json({currentUser: req.user});
}

exports.updateProfile = async (req, res) => {
    try{
        const {name, password, address} = req.body;
        const user = await User.findById(req.user._id);

        if(password && password<6){
            return res.json({
                error: "password is required and must be min 6 characters long"
            });
        }

        //hash password
        const hashedPassword = password ? await hashPassword(password) : undefined;

        const updated = await User.findByIdAndUpdate(
            req.user._id,
            {
                name: name || user.name,
                password: hashedPassword || user.password,
                address: address || user.address
            },
            { new: true }
        );
        updated.password = undefined;
        res.json(updated);
    }catch (err){
        console.log(err);
    }
}

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id })
            .populate("products", "-photo")
            .populate("buyer",name);
        res.json(orders);
    }catch (err){
        console.log(err)
    }
}

exports.allOrders = async (req, res) => {
    try{
        const orders = await Order.find({})
            .populate("products", "-photo")
            .populate("buyer",name)
            .sort({createdAt: "-1"});
        res.json(orders);
    }catch (err){
        console.log(err)
    }
}