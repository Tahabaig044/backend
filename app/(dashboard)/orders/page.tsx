// "use client"

// import { DataTable } from "@/components/custom ui/DataTable"
// import Loader from "@/components/custom ui/Loader"
// import { columns } from "@/components/orders/OrderColumns"
// import { Separator } from "@/components/ui/separator"

// import { useEffect, useState } from "react"

// const Orders = () => {
//   const [loading, setLoading] = useState(true)
//   const [orders, setOrders] = useState([])

//   const getOrders = async () => {
//     try {
//       const res = await fetch(`/api/orders`)
//       const data = await res.json()
//       setOrders(data)
//       setLoading(false)
//     } catch (err) {
//       console.log("[orders_GET", err)
//     }
//   }

//   useEffect(() => {
//     getOrders()
//   }, [])

//   return loading ? <Loader /> : (
//     <div className="px-10 py-5">
//       <p className="text-heading2-bold">Orders</p>
//       <Separator className="bg-grey-1 my-5"/>
//       <DataTable columns={columns} data={orders} searchKey="_id" />
//     </div>
//   )
// }

// export const dynamic = "force-dynamic";

// export default Orders


"use client"

import { DataTable } from "@/components/custom ui/DataTable"
import Loader from "@/components/custom ui/Loader"
import { columns } from "@/components/orders/OrderColumns" // This will need updates
import { Separator } from "@/components/ui/separator"

import { useEffect, useState } from "react"

const Orders = () => {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])

  const getOrders = async () => {
    try {
      // Ensure this URL is correct and accessible
      const res = await fetch(`${process.env.NEXT_PUBLIC_ADMIN_DASHBOARD_URL}/api/orders`)
      const data = await res.json()
      setOrders(data)
      setLoading(false)
    } catch (err) {
      console.error("[orders_GET]", err) // Use console.error for errors
      // You might want to add state to show an error message to the user
    }
  }

  useEffect(() => {
    getOrders()
  }, [])

  return loading ? <Loader /> : (
    <div className="px-10 py-5">
      <p className="text-heading2-bold">Orders</p>
      <Separator className="bg-grey-1 my-5"/>
      {/* Assuming your columns will now handle paymentStatus and orderStatus */}
      <DataTable columns={columns} data={orders} searchKey="_id" />
    </div>
  )
}

export const dynamic = "force-dynamic";
//  is typically for server components or route handlers.
// Since this is a client component, this line is less relevant here.
// If you put this component directly in a page.tsx, Next.js would treat the page as dynamic.
// For client components fetched data, you manage re-fetching yourself.

export default Orders