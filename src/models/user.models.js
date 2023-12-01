import mongoose from 'mongoose';
import { Jwt } from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        index:true //index = true will make any field searchable in optimize way,you should use it when u know that certain fields will be search every now and then
    },
    email: {
        type: String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
    },
    fullName: {
        type: String,
        required:true,
        lowercase:true,
        trim:true,
    },
    avatar: {
        type: String,
        required:true,
    },
    coverImage: {
        type: String,
    },
    watchHistory:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,"Password is required"],
    },
    refreshToken:{
        type:String
    },
    
},{
    timestamps:true
});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password,10);
    next();
});

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password); 
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },
        process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    })
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    })
}

export const User = mongoose.model('User',userSchema);