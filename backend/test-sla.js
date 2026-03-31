/**
 * Manual SLA Test Script
 * Run: node test-sla.js
 * What it does:
 *   1. Finds the first open grievance
 *   2. Sets its SLA deadline to the past (simulates breach)
 *   3. Runs the SLA monitor function directly
 *   4. Checks the DB to confirm it was escalated
 */
require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/agroseva';

const run = async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✓ Connected to MongoDB');

  const Grievance = require('./src/models/Grievance');

  // Step 1: Find any open grievance
  const g = await Grievance.findOne({ status: { $in: ['open', 'in_progress'] } });
  if (!g) {
    console.log('⚠ No open grievances found. Submit at least one grievance as a farmer first.');
    await mongoose.disconnect();
    return;
  }

  console.log(`✓ Found grievance: ${g.grievanceId} | Status: ${g.status} | SLA: ${g.slaDeadline}`);

  // Step 2: Set SLA to the past to simulate a breach
  await Grievance.findByIdAndUpdate(g._id, { slaDeadline: new Date('2020-01-01') });
  console.log('✓ Moved SLA deadline to 2020 (simulating breach)...');

  // Step 3: Run the SLA monitor
  console.log('\n--- Running SLA Monitor ---');
  const now = new Date();
  const result = await Grievance.updateMany(
    {
      status: { $in: ['open', 'in_progress', 'pending_info'] },
      slaDeadline: { $lt: now },
      isSlaBreach: false,
    },
    {
      $set: { isSlaBreach: true, status: 'escalated' },
      $push: {
        escalationHistory: {
          escalatedTo: 'Nodal Officer',
          reason: 'SLA deadline exceeded — auto-escalated by system (TEST)',
          at: now,
        },
      },
    }
  );

  console.log(`✓ SLA Monitor ran. Modified: ${result.modifiedCount} grievance(s)`);

  // Step 4: Verify the change
  const updated = await Grievance.findById(g._id);
  console.log(`\n--- Result ---`);
  console.log(`  Grievance ID : ${updated.grievanceId}`);
  console.log(`  Status       : ${updated.status}     ← should be 'escalated'`);
  console.log(`  isSlaBreach  : ${updated.isSlaBreach}  ← should be true`);
  console.log(`  Escalations  : ${updated.escalationHistory.length} record(s)`);
  
  if (updated.status === 'escalated' && updated.isSlaBreach === true) {
    console.log('\n✅ TEST PASSED — SLA Monitor is working correctly!');
  } else {
    console.log('\n❌ TEST FAILED — Check the cron logic.');
  }

  await mongoose.disconnect();
};

run().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
