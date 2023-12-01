import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser } from "../controllers/user.controller.js";

export const userRouter = Router();

userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
    );