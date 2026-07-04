import admin from "../lib/firebase.js";
import { db } from "../lib/firebase.js";

import {
  getPrayerSchedule,
  getMinutesNow,
  timeToMinutes,
  getSwedenDate
} from "../lib/prayer-times.js";

const BEFORE_ADHAN = 15;

async function getTokens() {
  const snapshot = await db.collection("users_tokens").get();

  const tokens = [];

  snapshot.forEach((doc) => {
    const data = doc.data();

    if (data.token) {
      tokens.push(data.token);
    }
  });

  return tokens;
}

async function sendNotification(title, body) {
  const tokens = await getTokens();

  if (!tokens.length) {
    return {
      success: false,
      message: "No tokens"
    };
  }

  const response = await admin.messaging().sendEachForMulticast({
    notification: {
      title,
      body
    },
    android: {
      priority: "high",
      notification: {
        sound: "default"
      }
    },
    webpush: {
      notification: {
        icon: "https://res.cloudinary.com/db9h7zm1h/image/upload/w_500,q_auto,f_auto/v1774918203/hi5hebyjkpi3gkdgrdef.jpg",
        badge: "https://res.cloudinary.com/db9h7zm1h/image/upload/w_500,q_auto,f_auto/v1774918203/hi5hebyjkpi3gkdgrdef.jpg"
      }
    },
    tokens
  });

  return {
    success: true,
    sent: response.successCount,
    failed: response.failureCount
  };
}

function todayKey() {
  const d = getSwedenDate();

  return (
    d.getFullYear() +
    "-" +
    (d.getMonth() + 1) +
    "-" +
    d.getDate()
  );
}

async function alreadySent(id) {
  const doc = await db
    .collection("notification_logs")
    .doc(id)
    .get();

  return doc.exists;
}

async function markSent(id) {
  await db
    .collection("notification_logs")
    .doc(id)
    .set({
      sent: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
}

async function sendHourlyReminder(nowMinutes) {

  const id = `${todayKey()}-hour-${Math.floor(nowMinutes / 60)}`;

const minute = nowMinutes % 60;

if (minute > 5) return null;

  if (await alreadySent(id)) return null;

  const result = await sendNotification(
    "🤍 صلِّ على النبي ﷺ",
    "اللهم صلِّ وسلم وبارك على سيدنا محمد ﷺ"
  );

  await markSent(id);

  return result;
}

async function sendPrayerNotifications(nowMinutes) {

  const prayers = getPrayerSchedule();

  for (const prayer of prayers) {

    const prayerMinutes = timeToMinutes(prayer.time);

    const beforeId =
      `${todayKey()}-${prayer.id}-before`;

    if (
      nowMinutes >= prayerMinutes - BEFORE_ADHAN &&
      nowMinutes < prayerMinutes
    ) {

      if (!(await alreadySent(beforeId))) {

        await sendNotification(
          `🕌 اقترب أذان ${prayer.name}`,
          `باقي ${BEFORE_ADHAN} دقيقة على أذان ${prayer.name}`
        );

        await markSent(beforeId);
      }
    }

    const adhanId =
      `${todayKey()}-${prayer.id}-adhan`;

    if (
      nowMinutes >= prayerMinutes &&
      nowMinutes < prayerMinutes + 5
    ) {

      if (!(await alreadySent(adhanId))) {

        await sendNotification(
          `🕌 أذان ${prayer.name}`,
          `حان الآن موعد أذان ${prayer.name}`
        );

        await markSent(adhanId);
      }
    }
  }
}
export default async function handler(req, res) {
  try {

    const nowMinutes = getMinutesNow();

    const prayerResult = await sendPrayerNotifications(nowMinutes);

    const hourlyResult = await sendHourlyReminder(nowMinutes);

    return res.status(200).json({
      success: true,
      swedenTime: getSwedenDate().toLocaleString("sv-SE", {
        timeZone: "Europe/Stockholm"
      }),
      nowMinutes,
      prayerNotification: prayerResult || "none",
      hourlyNotification: hourlyResult || "none"
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      error: error.message
    });

  }
}
