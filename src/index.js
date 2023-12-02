import dotenv from 'dotenv';
import { connectDB } from "./db/index.js";
import { app } from './app.js';

dotenv.config({ path: './env' })


connectDB()
.then(()=>{
app.listen(process.env.port || 3000,() => {
        console.log(`Listening on port ${process.env.port}`);
        app.on("error",(error) => {
                console.log(`Application unable to talk to DB: ${error}`);
                throw error;
        });
});
})
.catch((err) => console.log(`MONGODB connection error ${err}`))

// ;(async () => {
//     try {
//         const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         console.log(`\n DB Connected yay!! DB HOST: ${connectionInstance.connection.host} `);
        // app.on("error",(error) => {
        //     console.log(`Application unable to talk to DB: ${error}`);
        //     throw error;
        // })
//     } catch (error) {
//         console.error("ERROR",error);
//         process.exit(1);    
//     }
// })()