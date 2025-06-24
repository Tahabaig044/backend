import Customer from "@/lib/models/Customer";
import Order from "@/lib/models/Order";
import { connectToDB } from "@/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const POST = async (req: NextRequest) => {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("Stripe-Signature");

    if (!signature) {
      return new NextResponse("Missing Stripe-Signature header", { status: 400 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return new NextResponse("Webhook secret not configured", { status: 500 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error("[webhooks_POST] Invalid webhook signature", err);
      return new NextResponse("Invalid signature", { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const customerInfo = {
        clerkId: session?.client_reference_id || "N/A",
        name: session?.customer_details?.name || "Unknown",
        email: session?.customer_details?.email || "Unknown",
      };

      const shippingAddress = {
        street: session?.shipping_details?.address?.line1 || "N/A",
        city: session?.shipping_details?.address?.city || "N/A",
        state: session?.shipping_details?.address?.state || "N/A",
        postalCode: session?.shipping_details?.address?.postal_code || "N/A",
        country: session?.shipping_details?.address?.country || "N/A",
      };

      const retrieveSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items.data.price.product"],
      });

      const lineItems = retrieveSession?.line_items?.data || [];

      const orderItems = lineItems.map((item: any) => ({
        product: item?.price?.product?.metadata?.productId || "N/A",
        color: item?.price?.product?.metadata?.color || "N/A",
        size: item?.price?.product?.metadata?.size || "N/A",
        quantity: item?.quantity || 1,
      }));

      await connectToDB();

      const newOrder = new Order({
        customerClerkId: customerInfo.clerkId,
        products: orderItems,
        shippingAddress,
        shippingRate: session?.shipping_cost?.shipping_rate || "N/A",
        totalAmount: session.amount_total ? session.amount_total / 100 : 0,
      });

      await newOrder.save();

      let customer = await Customer.findOne({ clerkId: customerInfo.clerkId });

      if (customer) {
        customer.orders.push(newOrder._id);
      } else {
        customer = new Customer({
          ...customerInfo,
          orders: [newOrder._id],
        });
      }

      await customer.save();
    }

    return new NextResponse("Order created", { status: 200 });
  } catch (err) {
    console.error("[webhooks_POST]", err);
    return new NextResponse("Failed to create the order", { status: 500 });
  }
};
// import Customer from "@/lib/models/Customer";
// import Order from "@/lib/models/Order";
// import { connectToDB } from "@/lib/mongoDB";
// import { NextRequest, NextResponse } from "next/server";
// import { stripe } from "@/lib/stripe";

// export const POST = async (req: NextRequest) => {
//   try {
//     const rawBody = await req.text();
//     const signature = req.headers.get("Stripe-Signature");

//     if (!signature) {
//       console.error("[webhooks_POST] Missing Stripe-Signature header");
//       return new NextResponse("Missing Stripe-Signature header", { status: 400 });
//     }

//     if (!process.env.STRIPE_WEBHOOK_SECRET) {
//       console.error("[webhooks_POST] Webhook secret not configured");
//       return new NextResponse("Webhook secret not configured", { status: 500 });
//     }

//     let event;
//     try {
//       event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
//       console.log("[webhooks_POST] Received Stripe Event:", event.type);
//     } catch (err) {
//       console.error("[webhooks_POST] Invalid webhook signature", err);
//       return new NextResponse("Invalid signature", { status: 400 });
//     }

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;

//       console.log("[webhooks_POST] Checkout Session Completed:", session);

//       const customerInfo = {
//         clerkId: session?.client_reference_id || "N/A",
//         name: session?.customer_details?.name || "Unknown",
//         email: session?.customer_details?.email || "Unknown",
//       };

//       const shippingAddress = {
//         street: session?.shipping_details?.address?.line1 || "N/A",
//         city: session?.shipping_details?.address?.city || "N/A",
//         state: session?.shipping_details?.address?.state || "N/A",
//         postalCode: session?.shipping_details?.address?.postal_code || "N/A",
//         country: session?.shipping_details?.address?.country || "N/A",
//       };

//       console.log("[webhooks_POST] Extracted Customer Info:", customerInfo);
//       console.log("[webhooks_POST] Extracted Shipping Address:", shippingAddress);

//       // Retrieve session details with product info
//       const retrieveSession = await stripe.checkout.sessions.retrieve(session.id, {
//         expand: ["line_items.data.price.product"],
//       });

//       const lineItems = retrieveSession?.line_items?.data || [];
//       const orderItems = lineItems.map((item: any) => ({
//         product: item?.price?.product?.metadata?.productId || "N/A",
//         color: item?.price?.product?.metadata?.color || "N/A",
//         size: item?.price?.product?.metadata?.size || "N/A",
//         quantity: item?.quantity || 1,
//       }));

//       console.log("[webhooks_POST] Extracted Order Items:", orderItems);

//       // Connect to database
//       await connectToDB();

//       // Create and save the order
//       const newOrder = new Order({
//         customerClerkId: customerInfo.clerkId,
//         products: orderItems,
//         shippingAddress,
//         shippingRate: session?.shipping_cost?.shipping_rate || "N/A",
//         totalAmount: session.amount_total ? session.amount_total / 100 : 0,
//       });

//       try {
//         await newOrder.save();
//         console.log("[webhooks_POST] Order saved successfully:", newOrder);
//       } catch (error) {
//         console.error("[webhooks_POST] Error saving order:", error);
//         return new NextResponse("Failed to save order", { status: 500 });
//       }

//       // Check if customer exists
//       let customer = await Customer.findOne({ clerkId: customerInfo.clerkId });

//       if (customer) {
//         customer.orders.push(newOrder._id);
//       } else {
//         customer = new Customer({
//           ...customerInfo,
//           orders: [newOrder._id],
//         });
//       }

//       try {
//         await customer.save();
//         console.log("[webhooks_POST] Customer saved successfully:", customer);
//       } catch (error) {
//         console.error("[webhooks_POST] Error saving customer:", error);
//         return new NextResponse("Failed to save customer", { status: 500 });
//       }
//     }

//     return new NextResponse("Order created", { status: 200 });
//   } catch (err) {
//     console.error("[webhooks_POST] Unexpected error:", err);
//     return new NextResponse("Failed to process webhook", { status: 500 });
//   }
// };
