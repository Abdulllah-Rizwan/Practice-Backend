import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Jwt } from "jsonwebtoken";


const generateAccessAndRefreshToekns = async (userId) => {
   try {
      const user = await User.findById(userId);
      const accessToken = user.generateAccessToken();
      const refreshToken = user.generateRefreshToken();

      user.refreshToken = refreshToken;
      await user.save({validateBeforeSave:false});
      
      return { accessToken, refreshToken }
   } catch (error) {
      throw new ApiError(500,"Something went wrong whilst generating access and refresh token");
   }
}

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
   // console.log(req.body);
   // console.log({"fullName":fullName,"Email":email});

   if(
      [fullName,email,username,password].some((field) => field?.trim() === "" )
   ){
      throw new ApiError(400,"All Fields are required");
   }

   const existedUser = await User.findOne({
      $or: [ { username },{ email } ]
   });
   // console.log("Existed user:",existedUser)

   if(existedUser){
      throw new ApiError(409,"User already Exists")
   }

   const avatarLocalPath = req.files?.avatar[0]?.path;
   // const coverImageLocalPath = req.files?.coverImage[0]?.path;
   // console.log("req.files",req.files);
   // console.log("req.files.avatar",req.files.avatar);

   let coverImageLocalPath;
   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
      coverImageLocalPath = req.files.coverImage[0].path;
   }

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

   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   );

   if(!createdUser){
      throw new ApiError(500,"Something went wrong whilst registering the user");
   }

   return res.status(201).json(
      new ApiResponse(200,createdUser,"User registered successfuly")
   );
});

export const loginUser = asyncHandler(async(req,res) => {

   // data from req.body
   //username or email for login
   //find the user
   //check password
   //if password correct then generate access and refresh token
   //send secure cookie

   const {email,username,password} = req.body;

   if(!email && !username){
      throw new ApiError(400,"Email or Username is required");
   }

   const user = await User.findOne({
      $or: [{ email }, { username }]
   });

   if(!user){
      throw new ApiError(404,"User does not exist");
   }

   const isPasswordValid = await user.isPasswordCorrect(password);
   if(!isPasswordValid){
      throw new ApiError(401,"Invalid password");
   }

   const {accessToken, refreshToken} = await generateAccessAndRefreshToekns(user._id);

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

   const options = {
      httpOnly: true,
      secure:true
   }

   return res.
   status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("refreshToken",refreshToken,options)
   .json(
      new ApiResponse(
         200,
         {
            user: loggedInUser,
            accessToken,
            refreshToken
         },
         "User LoggedIn Successfully"
         )
   )

});

export const logoutUser = asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(req.user._id,
      {
         $set:{
            refreshToken:undefined
         }
      },
      {
         new:true
      }
      );

      const options = {
         httpOnly: true,
         secure:true
      }

      res.
      status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json(
         new ApiResponse(200,{},"User logged out")
      )
});

export const refreshAccessToken = asyncHandler(async(req,res) => {
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

   if(!incomingRefreshToken){
      throw new ApiError(401,"Unauthorized Request");
   }
try {
   
      const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
   
      const user = await User.findById(decodedToken?._id);
   
      if(!user){
         throw new ApiError(401,"Invalid Refresh Token");
      }
   
      if(incomingRefreshToken !== user?.refreshToken){
         throw new ApiError(401,"Refresh token either expired or Invalid");
      }
   
      const { accessToken,refreshToken } = await generateAccessAndRefreshToekns(user._id);
   
      const options = {
         httpOnly:true,
         secure:true
      }
   
      return res
      .status(200)
      .cookie("accessToken", accessToken,options)
      .cookie("refreshToken", refreshToken,options)
      .json(
         new ApiResponse(
            200,
            {
               accessToken,
               refreshToken
            },
            "Access Token refreshed successfully"
         )
      )
} catch (error) {
   throw new ApiError(401,error?.message || "Invalid refresh token");
}
});

export const changeCurrentPassword = asyncHandler(async(req,res) => {
   const {oldPassword,newPassword} = req.body;

   const user = await User.findById(req.user?._id);

   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

   if(!isPasswordCorrect) {
      throw new ApiError(400,"Invalid password");
   }

   user.password = newPassword;
   await user.save({validateBeforeSave:false});

   return res.status(200).json( new ApiResponse(200,{},"Password Changes successfuly") );
});

export const getCurrentUser = asyncHandler(async(req,res) => {
   return res.status(200).json( new ApiResponse(200,req.user,"User Fetched successfully") );
});

export const updateAccountDetail = asyncHandler(async(req,res) => {
   const {email} = req.body;
   
   if(!email){
      throw new ApiError(400,"Email should be provided");
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: { email }
      },
      {new:true} // will return the document after updating the document
      ).select("-password");

      return res.status(200).json( new ApiResponse(200,user,"Account details updated!") );
});

export const updateUserAvatar = asyncHandler(async(req,res) => {
   const avatarLocalPath = req.file?.path;

   if(!avatarLocalPath){
      throw new ApiError(400,"Avatar file is missing!");
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath);

   if(!avatar.url){
      throw new ApiError(400,"Error while uploading the avatar!");
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{ avatar: avatar.url }
      },
      { new:true }
      ).select("-password");

   return res.status(200).json( 
      new ApiResponse(200,user,"Avatar updated Successfuly") 
      );
});

export const updateUserCoverImage = asyncHandler(async(req,res) => {
   const coverImageLocalPath = req.file?.path;

   if(!coverImageLocalPath){
      throw new ApiError(400,"No cover image found");
   }

   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if(!coverImage.url){
      throw new ApiError(400,"Error while uploading the cover image!");
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: { coverImage: coverImage.url }
      },
      { new: true }
   ).select("-password");

   return res.status(200).json( 
      new ApiResponse(200,user,"Cover Image Updated successduly")
      );
});