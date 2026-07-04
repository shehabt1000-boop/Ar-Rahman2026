import admin from "../lib/firebase.js";
import { db } from "../lib/firebase.js";

export default async function handler(req, res) {
  try {
    const snapshot = await db.collection("users_tokens").get();

    const tokens = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.token) tokens.push(data.token);
    });

    if (tokens.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No tokens found"
      });
    }

    const message = {
      notification: {
        title: "الرحمن",
        body: "هذا إشعار تجريبي لجميع المستخدمين"
      },
      tokens: tokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return res.status(200).json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
