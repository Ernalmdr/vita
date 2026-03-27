import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  passportUploader: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 } 
  }).onUploadComplete(async ({ file }) => {
    console.log("Passport upload complete:", file.url);
  }),
  receiptUploader: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 } 
  }).onUploadComplete(async ({ file }) => {
    console.log("Receipt upload complete:", file.url);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
