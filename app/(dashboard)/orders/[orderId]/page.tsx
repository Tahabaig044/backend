// import { DataTable } from "@/components/custom ui/DataTable"
// import { columns } from "@/components/orderItems/OrderItemsColums"

// const OrderDetails = async ({ params }: { params: { orderId: string }}) => {
//   const res = await fetch(`${process.env.ADMIN_DASHBOARD_URL}/api/orders/${params.orderId}`)
//   const { orderDetails, customer } = await res.json()

//   const { street, city, state, postalCode, country } = orderDetails.shippingAddress

//   return (
//     <div className="flex flex-col p-10 gap-5">
//       <p className="text-base-bold">
//         Order ID: <span className="text-base-medium">{orderDetails._id}</span>
//       </p>
//       <p className="text-base-bold">
//         Customer name: <span className="text-base-medium">{customer.name}</span>
//       </p>
//       <p className="text-base-bold">
//         Shipping address: <span className="text-base-medium">{street}, {city}, {state}, {postalCode}, {country}</span>
//       </p>
//       <p className="text-base-bold">
//         Total Paid: <span className="text-base-medium">${orderDetails.totalAmount}</span>
//       </p>
//       <p className="text-base-bold">
//         Shipping rate ID: <span className="text-base-medium">{orderDetails.shippingRate}</span>
//       </p>
//       <DataTable columns={columns} data={orderDetails.products} searchKey="product"/>
//     </div>
//   )
// }

// export default OrderDetails
"use client" // This component needs to be a client component for state management and API calls

import { DataTable } from "@/components/custom ui/DataTable"
import { columns } from "@/components/orderItems/OrderItemsColums"
import { useEffect, useState } from "react"
import Loader from "@/components/custom ui/Loader" // Assuming you have a Loader component
import { useRouter } from "next/navigation" // Import useRouter for page refresh

const OrderDetails = ({ params }: { params: { orderId: string } }) => {
  const router = useRouter()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false)

  useEffect(() => {
    const getOrderDetails = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL}/api/orders/${params.orderId}`)
        if (!res.ok) {
          throw new Error(`Error fetching order details: ${res.statusText}`)
        }
        const data = await res.json()
        setOrderDetails(data.orderDetails)
        setCustomer(data.customer)
      } catch (err) {
        console.error("[order_details_GET]", err)
        // Handle error, maybe redirect or show a message
      } finally {
        setLoading(false)
      }
    }

    if (params.orderId) {
      getOrderDetails()
    }
  }, [params.orderId])

  const handlePaymentStatusToggle = async () => {
    if (!orderDetails || orderDetails.paymentStatus === 'paid') return; // Only toggle if unpaid

    setIsUpdatingPaymentStatus(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL}/api/orders/${params.orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentStatus: 'paid' }), // Always setting to 'paid'
      });

      if (res.ok) {
        const updatedData = await res.json();
        setOrderDetails((prev: any) => ({ ...prev, paymentStatus: updatedData.paymentStatus }));
        alert("Payment status updated to PAID!");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update payment status');
      }
    } catch (err: any) {
      console.error("[payment_status_PATCH]", err);
      alert(`Error updating payment status: ${err.message}`);
    } finally {
      setIsUpdatingPaymentStatus(false);
    }
  };


  if (loading) {
    return <Loader /> // Show a loader while data is being fetched
  }

  if (!orderDetails || !customer) {
    return <p className="p-10 text-body-bold">Order details not found.</p>
  }

  const { street, city, state, postalCode, country,phone } = orderDetails.shippingAddress

  return (
    <div className="flex flex-col p-10 gap-5">
      <p className="text-heading2-bold">Order Details</p>
      <hr className="my-3" />
      <p className="text-base-bold">
        Order ID: <span className="text-base-medium">{orderDetails._id}</span>
      </p>
      <p className="text-base-bold">
        Customer Name: <span className="text-base-medium">{customer.name}</span>
      </p>
      <p className="text-base-bold">
        Customer Email: <span className="text-base-medium">{customer.email}</span>
      </p>
      <p className="text-base-bold">
        Shipping Address: <span className="text-base-medium">{street}, {city}, {state}, {postalCode}, {country}, {phone}</span>
      </p>
      <p className="text-base-bold">
        Total Amount: <span className="text-base-medium">${orderDetails.totalAmount.toFixed(2)}</span>
      </p>
      {/* Display Payment Method and Status */}
      <p className="text-base-bold">
        Payment Method: <span className="text-base-medium">{orderDetails.paymentMethod}</span>
      </p>
      <div className="flex items-center gap-4">
        <p className="text-base-bold">
          Payment Status: <span className={`text-base-medium ${orderDetails.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>{orderDetails.paymentStatus}</span>
        </p>
        {orderDetails.paymentMethod === 'cod' && orderDetails.paymentStatus === 'unpaid' && (
          <button
            onClick={handlePaymentStatusToggle}
            disabled={isUpdatingPaymentStatus}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isUpdatingPaymentStatus ? 'Updating...' : 'Mark as Paid'}
          </button>
        )}
      </div>
      <p className="text-base-bold">
        Order Status: <span className="text-base-medium">{orderDetails.orderStatus}</span>
      </p>
      {/* Removed shippingRateId as it's not applicable for COD without Stripe */}
      <p className="text-base-bold">
        Shipping rate ID: <span className="text-base-medium">{orderDetails.shippingRate}</span>
      </p>
      <h3 className="text-heading3-bold mt-5">Ordered Products</h3>
      <DataTable columns={columns} data={orderDetails.products} searchKey="product"/>
    </div>
  )
}

export default OrderDetails