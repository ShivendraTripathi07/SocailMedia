import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import exp from "constants";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";

import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

// CONFIGURATIONS

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* File Storage*/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

/* Routes with file*/
app.get("/", (req, res) => {
  res.send("app is running");
});

app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

// Routes

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* Mongoose server */

const PORT = process.env.PORT || 6001;
// const URL = 'mongodb+srv://Shivendra:Sushma1234@cluster0.0z5n24o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //   useFindAndModify: false,
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Database connected on Server Port : ${PORT}`)
    );
    // Add Data one time
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((err) => console.log(`${err} did not connect`));
