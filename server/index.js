import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./database/db.js";

import certificateRoutes from "./routes/certificate.js";
// import Razorpay from "razorpay";
import SSLCommerzPayment from 'sslcommerz-lts'
import cors from "cors";


dotenv.config();

const store_id = process.env.STORE_ID
const store_passwd = process.env.STORE_PASSWORD
const is_live = false //true for live, false for sandbox

export const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)

// export const instance = new Razorpay({
//   key_id: process.env.Razorpay_Key,
//   key_secret: process.env.Razorpay_Secret,
// });

const app = express();

// using middlewares
app.use(express.json());
app.use(cors());

const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.use("/uploads", express.static("uploads"));

// importing routes
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import quizRoutes from './routes/quiz.js';


// using routes
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", adminRoutes);
app.use('/api/quiz', quizRoutes);
app.use("/api/certificate", certificateRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDb();
});
//mG8nXAaO7vYZU3BJEVpggODI