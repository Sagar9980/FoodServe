// importing
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRouter.js";

// App configuration
const app = express();
const PORT = process.env.PORT || 9000;

// MIddlewares
app.use(express.json());
app.use(cors());
dotenv.config();

app.get("/", (req, res) => {
  res.status(200).send("Server is running successfully!");
});
app.listen(PORT, () => console.log(`Server is running in port:  ${PORT}`));

//Database configuration
mongoose.connect(
  process.env.MONGODB_CONNECTION_URI,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) throw err;
    console.log("MongodB connection established!!");
  }
);

// Setting up Routes

app.use("/users", userRoutes);
