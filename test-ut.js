const fs = require('fs');
const env = fs.readFileSync('.env', 'utf-8');
const tokenMatch = env.match(/UPLOADTHING_TOKEN=(.*)/);
if (tokenMatch) {
  process.env.UPLOADTHING_TOKEN = tokenMatch[1].trim();
}

const { UTApi } = require('uploadthing/server');

async function test() {
  try {
    const utapi = new UTApi();
    console.log("Token present:", !!process.env.UPLOADTHING_TOKEN);
    // UTApi initialization might fail lazily or eagerly. 
    // Let's try to list something (empty list is fine)
    const files = await utapi.listFiles();
    console.log("SUCCESS: Connection to UploadThing established.");
    console.log("Found", files.files.length, "files.");
  } catch (err) {
    console.error("FAILURE:", err.message);
  }
}

test();
