import { storage } from "./firebase";
import { ref, uploadString, getDownloadURL, uploadBytes } from "firebase/storage";

/**
 * Uploads a base64 encoded image string (data URL) to Firebase Storage
 * and returns the public download URL.
 * 
 * @param path The destination path in the storage bucket (e.g., 'profiles/user123.jpg')
 * @param base64Data The base64 data URL string (e.g. 'data:image/jpeg;base64,...')
 * @returns Promise<string> The public download URL of the uploaded image
 */
export async function uploadBase64Image(path: string, base64Data: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    // uploadString supports 'data_url' format directly
    const snapshot = await uploadString(storageRef, base64Data, "data_url");
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`[Storage] Base64 image uploaded successfully to ${path}. Download URL: ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error(`[Storage] Failed to upload base64 image to ${path}:`, error);
    throw error;
  }
}

/**
 * Uploads a raw File or Blob object to Firebase Storage
 * and returns the public download URL.
 * 
 * @param path The destination path in the storage bucket
 * @param file The File or Blob to upload
 * @returns Promise<string> The public download URL
 */
export async function uploadFile(path: string, file: Blob | File): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`[Storage] File uploaded successfully to ${path}. Download URL: ${downloadURL}`);
    return downloadURL;
  } catch (error) {
    console.error(`[Storage] Failed to upload file to ${path}:`, error);
    throw error;
  }
}

/**
 * Retrieves the download URL for an existing file in Firebase Storage.
 * 
 * @param path The path of the file in the storage bucket
 * @returns Promise<string> The public download URL
 */
export async function getFileDownloadURL(path: string): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error(`[Storage] Failed to get download URL for ${path}:`, error);
    throw error;
  }
}
