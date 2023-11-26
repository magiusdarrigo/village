import supabaseClient from "../clients/supabaseClient";
import * as fs from "fs";
import convert from "heic-convert";
import { promisify } from "util";

const getBucketURL = (bucketName: string) => {
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${bucketName}/`;
};

export const uploadImageToSupabase = async (
  file: Express.Multer.File,
  userID: string,
  bucketName: string,
  folderName: string
) => {
  const filePath = file.path;
  const fileMimeType = file.mimetype;
  const fileContents = await promisify(fs.readFile)(filePath);

  // create file name based on user id and current time, also attach file extension
  const fileName = `${userID}_${Date.now()}.${fileMimeType.split("/")[1]}`;

  // Upload the image to the bucket 'post_images'
  const { data, error } = await supabaseClient.storage
    .from(bucketName)
    .upload(`${folderName}/${fileName}`, fileContents, {
      // cache set to 48 hours
      cacheControl: "172800",
      upsert: false,
      contentType: fileMimeType,
    });

  if (error) {
    throw error;
  }
  return getBucketURL(bucketName) + data.path;
};

export const convertFileIfNecessary = async (file: Express.Multer.File) => {
  const filePath = file.path;
  const fileMimeType = file.mimetype;

  switch (fileMimeType) {
    case "image/jpeg":
      return;
    case "image/png":
      return;
    case "image/gif":
      return;
    case "image/heic":
      await convertHeicToJpeg(filePath);
      return;
    default:
      throw new Error("Invalid file type.");
  }
};

const convertHeicToJpeg = async (filePath: string) => {
  try {
    const inputBuffer = await promisify(fs.readFile)(filePath);
    const outputBuffer = await convert({
      buffer: inputBuffer,
      format: "JPEG",
      quality: 1,
    });
    await promisify(fs.writeFile)(filePath, outputBuffer as any);
  } catch (error) {
    console.error("Error converting HEIC to JPEG:", error);
    throw error;
  }
};

export const deleteFileFromFS = async (filePath: string) => {
  try {
    await promisify(fs.unlink)(filePath);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};
