import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import { loginUser, logoutUser, registerUser,refreshAccessToken } from "../controllers/user.controller.js";

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

userRouter.route("/login").post(loginUser)

//secured route
userRouter.route("/logout").post(varifyJWT,logoutUser)
userRouter.route("/refresh-token").post(refreshAccessToken)