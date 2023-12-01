import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

export const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN
}));

app.use(express.json({limit:"20kb"}));
app.use(express.urlencoded({extended:true,limit:"20kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// Import Routes
import { userRouter } from './routes/user.routes.js';

app.use("/api/v1/users",userRouter);
