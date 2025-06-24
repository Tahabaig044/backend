import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDB = async (): Promise<void> => {
  mongoose.set("strictQuery", true)

  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL || "", {
      dbName: "Taha_Admin"
    })

    isConnected = true;
    console.log("MongoDB is connected");
  } catch (err) {
    console.log(err)
  }
}
// import mongoose from "mongoose";

// export const connectToDB = async () => {
//   try {
//     if (mongoose.connection.readyState === 1) {
//       console.log("[MongoDB] Already connected.");
//       return;
//     }
//     await mongoose.connect(process.env.MONGODB_URL || "", {
//     });
//     console.log("[MongoDB] Connected successfully.");
//   } catch (error) {
//     console.error("[MongoDB] Connection error:", error);
//     throw new Error("MongoDB connection failed");
//   }
// };
