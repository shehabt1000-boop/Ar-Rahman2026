import admin from "firebase-admin";
import fs from "fs";

let app;

if (!admin.apps.length) {
  let serviceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } else {
    serviceAccount = JSON.parse(
      fs.readFileSync("./al-rahman-d0529-firebase-adminsdk-fbsvc-7923d4d58c.json", "utf8")
    );
  }

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  app = admin.app();
}

const db = admin.firestore();

export default admin;
export { db };
