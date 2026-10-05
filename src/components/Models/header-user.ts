export type LoggedInUser = {
  id: string;
  name: string;
  email: string;
  // Assuming 'role' might also be a property based on your previous slice,
  // if not, you can remove it.
  role?: string; // Optional: Add if your user model includes a role
  fileStorage: {
    updatedAt: number | string; // Flexible for number (Date.now()) or string (Date.now().toString())
    fileStorageId: string;
    data: string; // Base64 encoded image data
    fileType: string; // E.g., 'image/jpeg', 'image/png'
  } | null; // It can be null if no profile picture is uploaded
};
