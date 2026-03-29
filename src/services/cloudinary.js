const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

const MIME_TYPES = {
    png: "image/png",
    webp: "image/webp",
};

/**
 * Uploads a local image URI to Cloudinary using an unsigned upload preset.
 * @param {string} imageUri - Local file URI from expo-image-picker (file://…)
 * @returns {Promise<string>} - The secure Cloudinary URL of the uploaded image
 */
export async function uploadImageToCloudinary(imageUri) {
    const filename = imageUri.split("/").pop();
    const ext = filename.split(".").pop().toLowerCase();
    const mimeType = MIME_TYPES[ext] ?? "image/jpeg";

    const formData = new FormData();
    formData.append("file", { uri: imageUri, name: filename, type: mimeType });
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
    );

    if (!response.ok) {
        throw new Error(`Cloudinary upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.secure_url;
}