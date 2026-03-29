const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Application = require('./src/models/Application');
const Document = require('./src/models/Document');

async function fix() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error("Missing MONGODB_URI");

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    const apps = await Application.find({ documents: { $exists: true, $not: {$size: 0} } });
    console.log(`Found ${apps.length} applications with documents attached.`);

    let fixedCount = 0;
    for (const app of apps) {
      const result = await Document.updateMany(
        { _id: { $in: app.documents }, applicationId: { $exists: false } }, // only fix those missing the ID
        { $set: { applicationId: app._id } }
      );
      fixedCount += result.modifiedCount;
    }

    console.log(`Retroactively linked ${fixedCount} orphaned Document records to their parent Applications!`);
    process.exit(0);
  } catch (err) {
    console.error("Failed to fix docs:", err);
    process.exit(1);
  }
}

fix();
