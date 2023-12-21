import  Jwt  from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandlers.js";

export const varifyJWT = asyncHandler(async(req,_,next)=>{
    try {
        const token =  req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!token){
            throw new ApiError(401,"Unauthorized Request");
        }
    
        const decodedToken = Jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        
        if(!user){
            throw new ApiError(401,"Invalid Access Token");
        }
    
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token");
    }
});