import { db } from "../lib/firebase.js";

export default async function handler(req, res) {
  try {
    const snapshot = await db.collection("users_tokens").get();

    const tokens = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      if (data.token) {
        tokens.push(data.token);
      }
    });

    return res.status(200).json({
      success: true,
      totalTokens: tokens.length,
      tokens
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
