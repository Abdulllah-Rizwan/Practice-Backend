import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";

export const registerUser = asyncHandler(async (req,res) => {
   //get user data from frontend
   //Validation 
   //check if user already exist: via username and email
   //files are present? (files = images,avatar etc)
   //upload them to cloudinary,avatar
   //create user objects - create entry in DB
   //remove password and refresh token field from response
   //check for user creation
   //return res

   const {fullName,email,username,password} = req.body;
   console.log({"fullName":fullName,"Email":email});

   if(
      [fullName,email,username,password].some((field) => field?.trim() === "" )
   ){
      throw new ApiError(400,"All Fields are required");
   }

   const existedUser = User.findOne({
      $or: [ { username },{ email } ]
   });
   console.log("Ecisted user:",existedUser)

   if(!existedUser){
      throw new ApiError(409,"User already Exists")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;
   console.log("req.files",req.files);
   console.log("req.files.avatar",req.files.avatar);

   if(!avatarLocalPath){
      throw new ApiError(400,"Avatar is required");
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if(!avatar){
      throw new ApiError(400,"Avatar is required");
   }

   const user = await User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
   });

   const createdUser = await user.findById(user._id).select(
      "-password -refreshToken"
   );

   if(!createdUser){
      throw new ApiError(500,"Something went wrong whilst registering the user");
   }

   return res.status(201).json(
      new ApiResponse(200,createdUser,"User registered successfuly")
   );
});