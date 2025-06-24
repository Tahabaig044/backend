import Customer from "@/lib/models/Customer";
import Order from "@/lib/models/Order";
import { connectToDB } from "@/lib/mongoDB";

import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB()

    const orders = await Order.find().sort({ createdAt: "desc" })

    const orderDetails = await Promise.all(orders.map(async (order) => {
      const customer = await Customer.findOne({ clerkId: order.customerClerkId })
      return {
        _id: order._id,
        customer: customer.name,
        products: order.products.length,
        totalAmount: order.totalAmount,
        createdAt: format(order.createdAt, "MMM do, yyyy")
        
      }
    }))

    return NextResponse.json(orderDetails, { status: 200 });
  } catch (err) {
    console.log("[orders_GET]", err)
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const dynamic = "force-dynamic";
// import { NextRequest, NextResponse } from "next/server";
// import { connectToDB } from "@/lib/mongoDB";
// import Order from "@/lib/models/Order";
// import Customer from "@/lib/models/Customer";

// CORS Headers (Achi practice hai ke yeh rakhein)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// Order create karne ke liye POST function
export async function POST(req: NextRequest) {
  try {
    await connectToDB();

    const { customer, cartItems, totalAmount, shippingAddress } = await req.json();

    // Check karein ke saari zaroori cheezein मौजूद hain ya nahi
    if (!customer || !cartItems || !totalAmount || !shippingAddress) {
      return new NextResponse(JSON.stringify({ message: "Not enough data to checkout" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const orderItems = cartItems.map((item: any) => ({
      product: item.item._id,
      color: item.color || "N/A",
      size: item.size || "N/A",
      quantity: item.quantity,
    }));

    // Naya order object banayein
    const newOrder = new Order({
      customerClerkId: customer.clerkId,
      products: orderItems,
      shippingAddress: shippingAddress,
      totalAmount: totalAmount,
      paymentMethod: 'cod',       // Payment method ko 'cod' set karein
      paymentStatus: 'unpaid',    // Default status 'unpaid' hoga
      orderStatus: 'confirmed',   // Order status 'confirmed' hoga
    });

    await newOrder.save();

    // Customer ko dhoond kar uske orders mein yeh naya order add karein
    let existingCustomer = await Customer.findOne({ clerkId: customer.clerkId });

    if (existingCustomer) {
      existingCustomer.orders.push(newOrder._id);
      await existingCustomer.save();
    } else {
      const newCustomer = new Customer({
        clerkId: customer.clerkId,
        name: customer.name,
        email: customer.email,
        orders: [newOrder._id],
      });
      await newCustomer.save();
    }
    
    // Naye order ki ID wapis bhejein
    return NextResponse.json({ orderId: newOrder._id }, { headers: corsHeaders });

  } catch (err) {
    console.log("[orders_POST]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
