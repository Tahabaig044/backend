import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  publicRoutes: ["/api/:path*"]
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
// import { authMiddleware } from "@clerk/nextjs";
// import { NextResponse } from "next/server";

// export default authMiddleware({
//   publicRoutes: ["/", "/api/:path*"],

//   async afterAuth(auth, req) {
//     const { userId } = auth;
//     const url = req.nextUrl;

//     const isAdminRoute = url.pathname.startsWith("/admin");

//     if (isAdminRoute) {
//       const adminId = process.env.ADMIN_ID;

//       if (!userId || userId !== adminId) {
//         return NextResponse.redirect(new URL("/", req.url)); // Redirect to homepage
//       }
//     }

//     // Default: allow access
//     return NextResponse.next();
//   },
// });

// export const config = {
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// };
