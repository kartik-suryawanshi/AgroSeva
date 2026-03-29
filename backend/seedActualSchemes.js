const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Scheme = require('./src/models/Scheme');
const Application = require('./src/models/Application');
const Grievance = require('./src/models/Grievance');
const Notification = require('./src/models/Notification');
const AuditLog = require('./src/models/AuditLog');

const actualSchemes = [
  {
    schemeCode: "PM-KISAN-001",
    schemeName: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    category: "subsidy",
    description: "An initiative by the government of India in which all farmers will get up to ₹6,000 per year as minimum income support.",
    fundingSource: "Government of India",
    governmentOrderNumber: "GOI-2019-KISAN1",
    benefits: {
      benefitType: "cash",
      benefitAmount: 6000,
      benefitUnit: "INR",
      paymentFrequency: "annual"
    },
    eligibilityCriteria: {
      farmerCategories: ["all"],
      maxLandAcres: 5,
      minLandAcres: 0.1,
      allowedCasteCategories: ["general", "obc", "sc", "st"],
      allowedCrops: [],
      maxAnnualIncome: 500000,
      minAge: 18,
      maxAge: 85,
      requiredLandType: ["irrigated", "unirrigated"],
      allowedStates: []
    },
    requiredDocuments: [
      { docType: "aadhaar", mandatory: true, label: "Aadhaar Card" },
      { docType: "bank_passbook", mandatory: true, label: "Bank Account Passbook" },
      { docType: "land_record", mandatory: true, label: "Land Record Extract" }
    ],
    timeline: {
      applicationStartDate: new Date("2025-01-01"),
      applicationEndDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180), // Active for next 6 months
      expectedDisbursementDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 210)
    },
    status: "active",
    applicationCount: 0,
    approvedCount: 0
  },
  {
    schemeCode: "PMFBY-002",
    schemeName: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    category: "insurance",
    description: "Comprehensive crop insurance scheme from pre-sowing to post-harvest losses against non-preventable natural risks.",
    fundingSource: "Government of India & State Government",
    governmentOrderNumber: "GOI-2016-FASAL2",
    benefits: {
      benefitType: "other",
      benefitAmount: 200000,
      benefitUnit: "INR",
      paymentFrequency: "one-time"
    },
    eligibilityCriteria: {
      farmerCategories: ["all"],
      maxLandAcres: 100,
      minLandAcres: 0.5,
      allowedCasteCategories: ["general", "obc", "sc", "st"],
      allowedCrops: ["wheat", "paddy", "cotton", "maize", "soybean"],
      maxAnnualIncome: 2000000,
      minAge: 18,
      maxAge: 80,
      requiredLandType: ["irrigated", "unirrigated"],
      allowedStates: []
    },
    requiredDocuments: [
      { docType: "aadhaar", mandatory: true, label: "Aadhaar Card" },
      { docType: "land_record", mandatory: true, label: "Sowing Certificate & Land Record" }
    ],
    timeline: {
      applicationStartDate: new Date("2025-01-01"),
      applicationEndDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), 
      expectedDisbursementDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 150)
    },
    status: "active",
    applicationCount: 0,
    approvedCount: 0
  },
  {
    schemeCode: "KCC-003",
    schemeName: "Kisan Credit Card (KCC) Scheme",
    category: "loan",
    description: "Provides timely credit to farmers for agricultural operations with simple procedures and subsidized interest rates at 4%.",
    fundingSource: "Public Sector Banks & NABARD",
    governmentOrderNumber: "GOI-1998-KCC3",
    benefits: {
      benefitType: "other",
      benefitAmount: 300000,
      benefitUnit: "INR",
      paymentFrequency: "one-time"
    },
    eligibilityCriteria: {
      farmerCategories: ["all"],
      maxLandAcres: 100,
      minLandAcres: 0.5,
      allowedCasteCategories: ["general", "obc", "sc", "st"],
      allowedCrops: [],
      maxAnnualIncome: 1000000,
      minAge: 18,
      maxAge: 70,
      requiredLandType: ["irrigated", "unirrigated"],
      allowedStates: []
    },
    requiredDocuments: [
      { docType: "aadhaar", mandatory: true, label: "Aadhaar Card" },
      { docType: "land_record", mandatory: true, label: "Land Ownership Record" },
      { docType: "passport_photo", mandatory: true, label: "Passport Size Photograph" }
    ],
    timeline: {
      applicationStartDate: new Date("2024-01-01"),
      applicationEndDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 5), // open long term
      expectedDisbursementDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14) // fast processing
    },
    status: "active",
    applicationCount: 0,
    approvedCount: 0
  },
  {
    schemeCode: "PKVY-004",
    schemeName: "Paramparagat Krishi Vikas Yojana (PKVY)",
    category: "subsidy",
    description: "Promotes organic farming through a cluster approach with financial assistance of ₹50,000 per hectare over 3 years.",
    fundingSource: "Government of India",
    governmentOrderNumber: "GOI-2015-PKVY4",
    benefits: {
      benefitType: "cash",
      benefitAmount: 50000,
      benefitUnit: "INR",
      paymentFrequency: "annual"
    },
    eligibilityCriteria: {
      farmerCategories: ["marginal", "small", "all"],
      maxLandAcres: 10,
      minLandAcres: 0.5,
      allowedCasteCategories: ["general", "obc", "sc", "st"],
      allowedCrops: [],
      maxAnnualIncome: 1500000,
      minAge: 18,
      maxAge: 75,
      requiredLandType: ["irrigated", "unirrigated"],
      allowedStates: []
    },
    requiredDocuments: [
      { docType: "aadhaar", mandatory: true, label: "Aadhaar Card" },
      { docType: "land_record", mandatory: true, label: "Land Record Extract" },
      { docType: "bank_passbook", mandatory: true, label: "Bank Account Passbook" }
    ],
    timeline: {
      applicationStartDate: new Date("2025-01-01"),
      applicationEndDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120),
      expectedDisbursementDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 180)
    },
    status: "active",
    applicationCount: 0,
    approvedCount: 0
  },
  {
    schemeCode: "SMAM-005",
    schemeName: "Sub-Mission on Agricultural Mechanization (SMAM)",
    category: "equipment",
    description: "Provides financial assistance and subsidy up to 80% to farmers for purchasing agricultural machinery and equipment.",
    fundingSource: "Government of India",
    governmentOrderNumber: "GOI-2014-SMAM5",
    benefits: {
      benefitType: "equipment",
      benefitAmount: 1000000,
      benefitUnit: "INR",
      paymentFrequency: "one-time"
    },
    eligibilityCriteria: {
      farmerCategories: ["marginal", "small"],
      maxLandAcres: 20,
      minLandAcres: 1,
      allowedCasteCategories: ["sc", "st", "general", "obc"], // Priority given to SC/ST normally
      allowedCrops: [],
      maxAnnualIncome: 800000,
      minAge: 18,
      maxAge: 75,
      requiredLandType: ["irrigated"],
      allowedStates: []
    },
    requiredDocuments: [
      { docType: "aadhaar", mandatory: true, label: "Aadhaar Card" },
      { docType: "land_record", mandatory: true, label: "Land Holding Proof" },
      { docType: "invoice", mandatory: true, label: "Machinery Quotation Invoice" }
    ],
    timeline: {
      applicationStartDate: new Date("2025-01-01"),
      applicationEndDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
      expectedDisbursementDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120)
    },
    status: "active",
    applicationCount: 0,
    approvedCount: 0
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error("Missing MONGODB_URI");

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB.");

    // Clean up old scheme data to make room for actual ones
    // We will clear Schemes, Applications, Grievances, Notifications, and AuditLogs to make the dashboard perfectly clean
    console.log("Clearing old demo data...");
    await Scheme.deleteMany({});
    await Application.deleteMany({});
    await Grievance.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});

    console.log("Seeding 5 actual government schemes...");
    await Scheme.insertMany(actualSchemes);

    console.log("Successfully seeded database with actual schemes.");
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed:", err);
    process.exit(1);
  }
}

seed();
