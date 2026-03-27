const dotenv = require("dotenv");
dotenv.config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("./src/models/User");
const Farmer = require("./src/models/Farmer");
const Scheme = require("./src/models/Scheme");
const Application = require("./src/models/Application");
const Grievance = require("./src/models/Grievance");
const Notification = require("./src/models/Notification");

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function yearsAgo(ageYears) {
  const d = new Date();
  d.setFullYear(d.getFullYear() - ageYears);
  return d;
}

function slugCode(prefix, i) {
  return `${prefix}-${String(i).padStart(3, "0")}`;
}

async function upsertUser({ mobileNumber, passwordPlain, role = "farmer", fullName }) {
  let user = await User.findOne({ mobileNumber });
  if (user) return user;

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordPlain, salt);

  user = await User.create({
    mobileNumber,
    passwordHash,
    role,
    isVerified: true,
    isActive: true,
  });

  return user;
}

async function upsertFarmerFromUser({ user, farmerId, fullName, district, state, aadhaarSuffix }) {
  let farmer = await Farmer.findOne({ userId: user._id });
  if (farmer) return farmer;

  const aadhaarNumber = `XXXX-XXXX-${String(aadhaarSuffix).padStart(4, "0")}`;

  farmer = await Farmer.create({
    userId: user._id,
    farmerId,
    personalDetails: {
      fullName,
      dateOfBirth: yearsAgo(35),
      gender: "male",
      aadhaarNumber,
      aadhaarVerified: true,
      casteCategory: "general",
      email: `${fullName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      mobileNumber: user.mobileNumber,
      profilePhoto: "",
    },
    address: {
      houseNo: "12A",
      village: "Demo Village",
      tehsil: "Demo Tehsil",
      district,
      state,
      pincode: "380001",
    },
    landDetails: {
      surveyNumber: `SURV-${Math.floor(1000 + Math.random() * 9000)}`,
      totalLandAcres: 2.5,
      landType: "irrigated",
      ownershipType: "owned",
      primaryCrop: "wheat",
      secondaryCrop: "paddy",
      irrigationSource: "canal",
    },
    bankDetails: {
      bankName: "State Bank of India",
      branchName: "Demo Branch",
      accountNumber: "991234567890",
      ifscCode: "SBIN0001234",
      accountHolderName: fullName,
    },
    annualIncome: 250000,
    documents: [],
    isProfileComplete: true,
    profileCompletionPercent: 100,
  });

  return farmer;
}

function buildSchemePayload({ schemeCode, schemeName, category, description, i }) {
  const timelineStart = daysFromNow(-5);
  const timelineEnd = daysFromNow(60 + i);
  const expectedDisbursementDate = daysFromNow(120 + i);

  const isSubsidy = category === "subsidy";

  // Eligibility criteria must exist or the eligibility engine will crash.
  const eligibilityCriteria = {
    farmerCategories: ["all"],
    maxLandAcres: 10,
    minLandAcres: 0.5,
    allowedCasteCategories: ["general", "obc", "sc", "st"],
    allowedCrops: ["wheat", "paddy", "cotton"],
    maxAnnualIncome: 500000,
    minAge: 18,
    maxAge: 80,
    requiredLandType: ["irrigated", "unirrigated", "forest"],
    allowedStates: ["Gujarat"],
    customRules: [],
  };

  const requiredDocuments = [
    { docType: "aadhaar", mandatory: true, label: "Aadhaar Card (Linked to mobile)" },
    { docType: "land_record", mandatory: true, label: "Land Record Extract (7/12 or equivalent)" },
    { docType: "bank_passbook", mandatory: false, label: "Bank Passbook (First Page)" },
  ];

  return {
    schemeCode,
    schemeName,
    category,
    description,
    fundingSource: "Government of India",
    governmentOrderNumber: `GOI-${2026}-0${(i % 9) + 1}${i}`,
    benefits: {
      benefitType: isSubsidy ? "cash" : "other",
      benefitAmount: isSubsidy ? 2000 * (i + 1) : 10000 * (i + 1),
      benefitUnit: "INR",
      paymentFrequency: "one-time",
    },
    eligibilityCriteria,
    requiredDocuments,
    timeline: {
      applicationStartDate: timelineStart,
      applicationEndDate: timelineEnd,
      expectedDisbursementDate,
    },
    status: "active",
    applicationCount: 0,
    approvedCount: 0,
  };
}

async function upsertScheme(payload) {
  const existing = await Scheme.findOne({ schemeCode: payload.schemeCode });
  if (existing) return existing;
  return Scheme.create(payload);
}

async function upsertApplication({ applicationId, farmer, scheme, status, timelineStages, reviewRemarks, rejectionReason, disbursedAmount }) {
  const existing = await Application.findOne({ applicationId });
  if (existing) return existing;

  const application = await Application.create({
    applicationId,
    farmerId: farmer._id,
    schemeId: scheme._id,
    submittedData: {
      landDetails: farmer.landDetails,
      cropDetails: { primaryCrop: farmer.landDetails.primaryCrop, secondaryCrop: farmer.landDetails.secondaryCrop },
      bankDetails: farmer.bankDetails,
      personalDetails: farmer.personalDetails,
    },
    documents: [],
    eligibilityResult: {
      isEligible: status !== "rejected" && status !== "ineligible",
      score: status === "rejected" || status === "ineligible" ? 25 : 78,
      criteriaResults: [],
      evaluatedAt: new Date(),
      evaluatedBy: "system",
    },
    fraudFlags: [],
    status,
    timeline: timelineStages.map((s) => ({
      stage: s.stage,
      completedAt: s.completedAt,
      completedBy: null,
      remarks: s.remarks,
    })),
    assignedOfficer: null,
    reviewRemarks: reviewRemarks || "",
    rejectionReason: rejectionReason || "",
    disbursementDate: status === "disbursed" ? daysFromNow(-10) : null,
    disbursementAmount: status === "disbursed" ? disbursedAmount || 50000 : null,
    disbursementReference: status === "disbursed" ? `REF-${applicationId}` : null,
  });

  return application;
}

async function upsertGrievance({ grievanceId, farmer, application, category, subject, description, status }) {
  const existing = await Grievance.findOne({ grievanceId });
  if (existing) return existing;

  return Grievance.create({
    grievanceId,
    farmerId: farmer._id,
    relatedApplicationId: application?._id || null,
    category,
    subject,
    description,
    attachments: [],
    preferredResolutionDate: daysFromNow(15),
    nlpAnalysis: {
      detectedCategory: category,
      urgencyScore: 0.4,
      sentimentScore: 0.2,
      keywords: ["demo", "portal"],
      processedAt: new Date(),
      ocrEngine: "none",
    },
    priority: "medium",
    assignedDepartment: "Agriculture",
    assignedOfficer: null,
    status,
    conversation: [],
    resolutionNotes: status === "resolved" ? "Resolved via portal demo." : "",
    resolvedAt: status === "resolved" ? daysFromNow(-2) : null,
    resolvedBy: null,
    resolutionRating: status === "resolved" ? 5 : null,
    escalationHistory: [],
    slaDeadline: daysFromNow(10),
    isSlaBreach: false,
  });
}

async function upsertNotification({ recipientUser, type, title, message, data }) {
  // We key by recipient + type + title to avoid duplicates.
  const existing = await Notification.findOne({ recipientId: recipientUser._id, type, title });
  if (existing) return existing;

  return Notification.create({
    recipientId: recipientUser._id,
    type,
    title,
    message,
    data: data || {},
    channel: ["in_app"],
    isRead: false,
    readAt: null,
    sentAt: new Date(),
  });
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Missing MONGODB_URI in environment.");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  // 1) Seed Schemes: 10 subsidy + 10 other categories
  const categoriesOther = ["insurance", "loan", "equipment", "input"];
  const otherSchemesCount = 10;
  const subsidySchemesCount = 10;

  const activeSchemePromises = [];

  for (let i = 0; i < subsidySchemesCount; i++) {
    const payload = buildSchemePayload({
      schemeCode: slugCode("GOV-SUB", i + 1),
      schemeName: `Demo Subsidy Scheme ${i + 1}`,
      category: "subsidy",
      description: "Demo active subsidy scheme for MVP.",
      i,
    });
    activeSchemePromises.push(upsertScheme(payload));
  }

  for (let i = 0; i < otherSchemesCount; i++) {
    const category = categoriesOther[i % categoriesOther.length];
    const payload = buildSchemePayload({
      schemeCode: slugCode("GOV-OTH", i + 1),
      schemeName: `Demo Government Program ${category.toUpperCase()} ${i + 1}`,
      category,
      description: `Demo active ${category} government scheme for MVP.`,
      i,
    });
    activeSchemePromises.push(upsertScheme(payload));
  }

  const seededSchemes = await Promise.all(activeSchemePromises);

  // 2) Seed Farmer users (so the dashboard actually shows non-zero counts)
  const passwordPlain = "farmer123";

  const farmerUsers = [
    { mobileNumber: "9876543210", fullName: "Asha Patel", district: "Banaskantha", state: "Gujarat", aadhaarSuffix: 1234, farmerId: "AGR-2026-10001" },
    { mobileNumber: "9876500001", fullName: "Neha Singh", district: "Patan", state: "Gujarat", aadhaarSuffix: 2345, farmerId: "AGR-2026-10002" },
  ];

  const seededFarmerRecords = [];
  for (const fu of farmerUsers) {
    const user = await upsertUser({ mobileNumber: fu.mobileNumber, passwordPlain, role: "farmer", fullName: fu.fullName });
    const farmer = await upsertFarmerFromUser({
      user,
      farmerId: fu.farmerId,
      fullName: fu.fullName,
      district: fu.district,
      state: fu.state,
      aadhaarSuffix: fu.aadhaarSuffix,
    });
    seededFarmerRecords.push({ user, farmer });
  }

  const primary = seededFarmerRecords[0];
  const [s0, s1, s2, s3, s4, s5] = seededSchemes;

  // 3) Seed Applications for primary farmer: cover multiple statuses
  const baseTimeline = (offsetDays, stages) =>
    stages.map((stage, idx) => ({
      stage,
      completedAt: daysFromNow(offsetDays + idx * 3),
      remarks: "Portal demo event",
    }));

  const applicationsToSeed = [
    {
      applicationId: "APP-2026-100001",
      scheme: s0,
      status: "submitted",
      timelineStages: baseTimeline(-30, ["Application Submitted"]),
    },
    {
      applicationId: "APP-2026-100002",
      scheme: s1,
      status: "documents_pending",
      timelineStages: baseTimeline(-20, ["Documents Submitted"]),
    },
    {
      applicationId: "APP-2026-100003",
      scheme: s2,
      status: "under_review",
      timelineStages: baseTimeline(-15, ["Under Review", "Application Submitted"]),
    },
    {
      applicationId: "APP-2026-100004",
      scheme: s3,
      status: "eligible",
      timelineStages: baseTimeline(-10, ["Approved", "Application Submitted"]),
    },
    {
      applicationId: "APP-2026-100005",
      scheme: s4,
      status: "approved",
      timelineStages: baseTimeline(-12, ["Approved", "Application Submitted"]),
    },
    {
      applicationId: "APP-2026-100006",
      scheme: s5,
      status: "disbursed",
      timelineStages: baseTimeline(-8, ["Disbursed", "Approved", "Under Review"]),
      disbursedAmount: 75000,
    },
    {
      applicationId: "APP-2026-100007",
      scheme: s0,
      status: "rejected",
      timelineStages: baseTimeline(-6, ["Rejected", "Under Review"]),
      rejectionReason: "Demo rejection: eligibility mismatch.",
      reviewRemarks: "Please re-apply after updating details.",
    },
    {
      applicationId: "APP-2026-100008",
      scheme: s1,
      status: "ineligible",
      timelineStages: baseTimeline(-4, ["Rejected", "Documents Submitted"]),
      rejectionReason: "Demo ineligibility: not meeting mandatory rules.",
      reviewRemarks: "Your application is not eligible.",
    },
  ];

  const applications = await Promise.all(
    applicationsToSeed.map((a) =>
      upsertApplication({
        applicationId: a.applicationId,
        farmer: primary.farmer,
        scheme: a.scheme,
        status: a.status,
        timelineStages: a.timelineStages,
        reviewRemarks: a.reviewRemarks,
        rejectionReason: a.rejectionReason,
        disbursedAmount: a.disbursedAmount,
      })
    )
  );

  // 4) Seed grievance + notifications for primary farmer
  const latestApp = applications[applications.length - 1];
  await upsertGrievance({
    grievanceId: "GRV-2026-90001",
    farmer: primary.farmer,
    application: latestApp,
    category: "subsidy_delay",
    subject: "Delay in scheme processing",
    description: "Demo grievance for portal MVP.",
    status: "resolved",
  });

  await upsertNotification({
    recipientUser: primary.user,
    type: "application_submitted",
    title: "Application Submitted",
    message: "Your demo application has been received and is under processing.",
    data: { applicationId: latestApp.applicationId },
  });

  console.log("MVP dummy data seeded successfully.");
  process.exit(0);
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});

