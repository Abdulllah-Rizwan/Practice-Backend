import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { varifyJWT } from "../middlewares/auth.middleware.js";
import { 
    loginUser, 
    logoutUser, 
    registerUser,
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetail, 
    updateUserAvatar, 
    updateUserCoverImage, 
    GetUserChannelProfile, 
    getWatchHistory 
} from "../controllers/user.controller.js";

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
userRouter.route("/cover-image").patch(varifyJWT,upload.single("/coverimage"),updateUserCoverImage);
userRouter.route("/avatar").patch(varifyJWT,upload.single("avatar"),updateUserAvatar);
userRouter.route("/change-password").post(varifyJWT,changeCurrentPassword);
userRouter.route("/update-account").patch(varifyJWT,updateAccountDetail);
userRouter.route("/c/:username").get(varifyJWT,GetUserChannelProfile);
userRouter.route("/current-user").get(varifyJWT,getCurrentUser);
userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter.route("/history").get(varifyJWT,getWatchHistory);
userRouter.route("/logout").post(varifyJWT,logoutUser);