"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export const columns: ColumnDef<OrderColumnType>[] = [
  {
    accessorKey: "_id",
    header: "Order",
    cell: ({ row }) => {
      return (
        <Link
          href={`/orders/${row.original._id}`}
          className="hover:text-red-1"
        >
          {row.original._id}
        </Link>
      );
    },
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "totalAmount",
    header: "Total ($)",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
];

// "use client"

// import { ColumnDef } from "@tanstack/react-table"
// import Link from "next/link"

// export const columns: ColumnDef<any>[] = [
//   {
//     accessorKey: "_id",
//     header: "Order ID",
//     cell: ({ row }) => (
//       <Link href={`/orders/${row.original._id}`} className="hover:text-red-1">
//         {row.original._id}
//       </Link>
//     ),
//   },
//   {
//     accessorKey: "customerClerkId",
//     header: "Customer ID",
//   },
//   {
//     accessorKey: "products",
//     header: "Products",
    
//   },
//   {
//     accessorKey: "totalAmount",
//     header: "Total ($)",
//     cell: ({ row }) => `$${row.original.totalAmount.toFixed(2)}`,
//   },
//   {
//     accessorKey: "paymentMethod",
//     header: "Payment Method",
    
//   },
//   {
//     accessorKey: "paymentStatus",
//     header: "Payment Status",
//     cell: ({ row }) => (
//       <span className={`${row.original.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
//         {row.original.paymentStatus}
//       </span>
//     ),
//   },
//   {
//     accessorKey: "orderStatus",
//     header: "Order Status",
//   },
//   {
//     accessorKey: "createdAt",
//     header: "Created At",
//   },
//   {
//     accessorKey: "phone",
//     header: "Phone",
//   },
  
  
// ]
