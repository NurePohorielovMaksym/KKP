import fs from 'fs';
import { imagekit } from './imagekit.js';

export async function UploadToImageKit(file) {
  if (!file) return null;

  const fileBuffer = fs.readFileSync(file.path);

  const res = await imagekit.upload({
    file: fileBuffer,             
    fileName: file.originalname,  
    folder: '/collectify-products'
  });

  return res.url;                 
}