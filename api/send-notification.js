export default function handler(req, res) {
  res.status(200).json({
    success: true,
    message: "API works successfully",
    time: new Date().toISOString()
  });
} 