# AgroSeva — Manual Testing Guide for AI & OCR Services

This guide provides a step-by-step walkthrough for manual testing of the AI-powered features in the AgroSeva platform, designed from the perspective of an end-user (Farmer) and an official (Admin).

---

## 1. Document OCR (Optical Character Recognition)
**Purpose:** Automatically extract sensitive information (Aadhaar, PAN) from uploaded documents to speed up verification.

### Testing Flow (Farmer Perspective)
1. **Login:** Log in to the portal as a **Farmer**.
2. **Apply for Scheme:**
   - Navigate to the **"Schemes"** section and select any scheme (e.g., *PM-Kisan*).
   - Click **"Apply Now"**.
3. **Upload Documents (Step 3):**
   - Head to the **"Document Upload"** step.
   - Prepare a clear image (.jpg or .png) of an **Aadhaar Card** or **PAN Card**.
   - Upload the file to the respective field.
4. **Wait for Processing:**
   - Once uploaded, the backend enqueues an AI task. Wait for 5–10 seconds.
5. **Verify Extraction (Admin Perspective):**
   - Log in as an **Admin**.
   
   - Navigate to **"Document Verification"** in the sidebar.
   - Select the recent application.
   - Check the **"AI Extracted Data (OCR)"** box on the right.
   - **Success Criteria:** The Aadhaar or PAN number should be correctly extracted and displayed in the yellow "AI Extracted Data" panel.

---

## 2. AI-Driven Grievance Analysis (NLP)
**Purpose:** Categorize complaints, detect sentiment, and automatically set priority based on the urgency of the message.

### Testing Flow (Farmer Perspective)
1. **Login:** Log in as a **Farmer**.
2. **File Grievance:**
   - Navigate to **"Grievances"** -> **"File New Grievance"**.
   - **Test Scenario A (Urgent):**
     - Subject: `Extremely Urgent: Subsidy not received`
     - Description: `I am in a desperate situation. My subsidy has been delayed for 6 months and I cannot buy seeds for the next season. Please help immediately.`
   - **Test Scenario B (Routine):**
     - Subject: `General Query about Scheme`
     - Description: `I just wanted to know the eligibility criteria for the irrigation scheme. Please let me know when convenient.`
3. **Submit:** Click **"Submit Grievance"**.

### Testing Flow (Admin Perspective)
1. **Navigate to Management:** Log in as **Admin** and go to **"Grievance Management"**.
2. **Observe Auto-Categorization:**
   - **For Scenario A:** The ticket should automatically show a **"Critical"** or **"High"** priority (red badge) and be assigned to the **"Subsidy Department"**.
   - **For Scenario B:** The ticket should show **"Low"** or **"Medium"** priority and be assigned to **"General Inquiry"**.
3. **Success Criteria:** The "SLA Deadline" should be shorter for the urgent ticket (e.g., 2 days) compared to the routine ticket (e.g., 14 days).

---

## 3. Predictive Trend Analysis (Forecasting)
**Purpose:** Use historical data to predict future application volumes and grievance trends.

### Testing Flow (Admin Perspective)
1. **Login:** Log in as **Admin**.
2. **View Dashboard:** Navigate to the main **"Admin Dashboard"** or **"Reports"**.
3. **Check Charts:**
   - Look for charts labeled **"Application Forecast"** or **"Grievance Trends"**.
   - Observe the dashed lines or highlighted sections showing the **next 30 days**.
4. **Verify Dynamics:**
   - If you add 5–10 more applications/grievances in the system, refresh the dashboard.
   - The AI service (Prophet model) will re-calculate the forecast.
5. **Success Criteria:** The graph should display a continuous line extending into future dates based on the historical "training" data currently in the database.

---

## Summary of Manual Test Cases

| Feature | Action | Expected Outcome |
| :--- | :--- | :--- |
| **OCR** | Upload Aadhaar Image | Aadhaar number appears in Admin Verification panel. |
| **NLP** | Submit "Desperate" complaint | Priority auto-sets to "Critical"; Dept auto-sets to relevant one. |
| **NLP** | Submit "General" query | Priority auto-sets to "Low"; SLA set for 14 days. |
| **Prediction** | View Report Chart | Chart shows 30-day future prediction based on current stats. |

---
> [!TIP]
> **Pro Tip for Testing OCR:** Ensure your test images are high-resolution and the text is not blurry. Tesseract (the engine used) performs best with clear, horizontal text on a high-contrast background.
