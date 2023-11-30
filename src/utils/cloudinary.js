import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
        
export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        });
        // File has been uploaded successfuly
        console.log("File has been uploaded on cloudinary...");
        console.log("response: ",response);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); //remove the locally saved temp file as the upload has failed
        return null;
    }
}


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key:  process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});