import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  passportUploader: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 } 
  }).onUploadComplete(async ({ file }) => {
    // BURASI DEĞİŞTİ: file.url yerine file.ufsUrl kullanıyoruz
    console.log("Passport upload complete:", file.ufsUrl);
  }),
  
  receiptUploader: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    pdf: { maxFileSize: "4MB", maxFileCount: 1 } 
  }).onUploadComplete(async ({ file }) => {
    // BURASI DEĞİŞTİ: file.url yerine file.ufsUrl kullanıyoruz
    console.log("Receipt upload complete:", file.ufsUrl);
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;