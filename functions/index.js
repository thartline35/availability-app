const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const logger = require("firebase-functions/logger");

admin.initializeApp();

const db = admin.firestore();

exports.fetchSchedule = onRequest(async (req, res) => {
  const {uid} = req.query;

  if (!uid) {
    res.status(400).send("Missing user ID");
    return;
  }

  try {
    const docRef = db.collection("availability").doc(uid);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      logger.info("Schedule found for user:", uid);
      res.status(200).send(docSnap.data());
    } else {
      logger.info("No schedule found for user:", uid);
      res.status(404).send("No schedule found");
    }
  } catch (error) {
    logger.error("Error fetching schedule:", error);
    res.status(500).send("Error fetching schedule");
  }
});

// New line needed at end of file?
