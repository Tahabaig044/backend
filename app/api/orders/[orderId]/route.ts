import Customer from "@/lib/models/Customer";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import { connectToDB } from "@/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";

// GET Order Details by ID
export const GET = async (
  req: NextRequest,
  { params }: { params: { orderId: string } }
) => {
  try {
    await connectToDB();

    const orderDetails = await Order.findById(params.orderId).populate({
      path: "products.product",
      model: Product,
    });

    if (!orderDetails) {
      return new NextResponse(JSON.stringify({ message: "Order Not Found" }), { status: 404 });
    }

    const customer = await Customer.findOne({ clerkId: orderDetails.customerClerkId });

    return NextResponse.json({ orderDetails, customer }, { status: 200 });
  } catch (err) {
    console.log("[orderId_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

// PATCH Update Payment Status
export const PATCH = async (
  req: NextRequest,
  { params }: { params: { orderId: string } }
) => {
  try {
    await connectToDB();

    const { paymentStatus } = await req.json();

    if (!["paid", "unpaid"].includes(paymentStatus)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid payment status value" }),
        { status: 400 }
      );
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      params.orderId,
      { paymentStatus },
      { new: true }
    );

    if (!updatedOrder) {
      return new NextResponse(JSON.stringify({ message: "Order not found" }), { status: 404 });
    }

    return NextResponse.json({ paymentStatus: updatedOrder.paymentStatus }, { status: 200 });
  } catch (err) {
    console.error("[orderId_PATCH]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";
