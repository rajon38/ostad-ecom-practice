const mongoose = require("mongoose");

const {Schema} = mongoose;
const {ObjectId} = mongoose.Schema;

const orderSchema = new Schema(
    {
        products: [{
            type: ObjectId, ref: "Product"
        }],
        payment:{},
        buyer:{ type: ObjectId, ref: "User"},
        status:{
            type: String,
            default: "Not Process",
            enum:[
                "Not Processed",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled"
            ]
        }
    },
    {timestamps: true, versionKey: false}
);

const Order = mongoose.model("order", orderSchema);
module.exports = Order;