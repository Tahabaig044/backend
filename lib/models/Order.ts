// import mongoose from "mongoose";

// const orderSchema = new mongoose.Schema({
//   customerClerkId: String,
//   products: [
//     {
//       product: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Product",
//       },
//       color: String,
//       size: String,
//       quantity: Number,
//     },
//   ],
//   shippingAddress: {
//     street: String,
//     city: String,
//     state: String,
//     postalCode: String,
//     country: String,
//   },
//   shippingRate: String,
//   totalAmount: Number,
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

// export default Order;
import mongoose, { Document, Schema, Model } from "mongoose";

// Order document ke liye TypeScript Interface
export interface IOrder extends Document {
  customerClerkId: string;
  products: Array<{
    product: mongoose.Schema.Types.ObjectId;
    color?: string;
    size?: string;
    quantity: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  totalAmount: number;
  paymentMethod: 'cod'; // Payment ka tareeqa
  paymentStatus: 'unpaid' | 'paid'; // Payment hui ya nahi
  orderStatus: 'confirmed' | 'shipped' | 'delivered' | 'cancelled'; // Order ka status
  createdAt: Date;
}

const orderSchema: Schema<IOrder> = new mongoose.Schema({
  customerClerkId: { type: String, required: true },
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      color: String,
      size: String,
      quantity: Number,
    },
  ],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true }, // Phone number zaroori hai
  },
  totalAmount: { type: Number, required: true },
  // Zaroori fields jo COD ke liye hain
  paymentMethod: {
    type: String,
    enum: ['cod'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid', // COD order shuru mein 'unpaid' hoga
    required: true,
  },
  
  orderStatus: {
    type: String,
    enum: ['confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'confirmed', // Order foran 'confirmed' ho jayega
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>("Order", orderSchema);

export default Order;