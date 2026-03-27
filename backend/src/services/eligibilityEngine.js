/**
 * Deterministic rule-based eligibility engine
 */

function resolvePath(obj, path) {
  return path.split('.').reduce((o, p) => (o ? o[p] : undefined), obj);
}

function evaluateEligibility(farmer, scheme) {
  const criteriaResults = [];
  let totalWeight = 0;
  let weightedScore = 0;
  let mandatoryFailed = [];

  const addResult = (criterion, passed, farmerValue, requiredValue, message, weight, isMandatory = true) => {
    criteriaResults.push({ criterion, passed, farmerValue, requiredValue, message, weight });
    totalWeight += weight;
    if (passed) {
      weightedScore += weight;
    } else if (isMandatory) {
      mandatoryFailed.push(criterion);
    }
  };

  const { eligibilityCriteria } = scheme;
  const { landDetails, personalDetails, address, annualIncome } = farmer;

  // RULE 1: Farmer category check (Weight: 20)
  const landAcres = landDetails?.totalLandAcres || 0;
  let farmerCategory = 'large';
  if (landAcres <= 1) farmerCategory = 'marginal';
  else if (landAcres <= 2) farmerCategory = 'small';

  const catPassed = eligibilityCriteria.farmerCategories.includes('all') || eligibilityCriteria.farmerCategories.includes(farmerCategory);
  addResult(
    'Farmer Category',
    catPassed,
    farmerCategory,
    eligibilityCriteria.farmerCategories.join(', '),
    catPassed ? `Farmer qualifies as ${farmerCategory} ✓` : `Farmer category ${farmerCategory} not allowed ✗`,
    20
  );

  // RULE 2: Land size check (Weight: 15)
  if (eligibilityCriteria.maxLandAcres !== undefined || eligibilityCriteria.minLandAcres !== undefined) {
    let landPassed = true;
    let reqMsg = [];
    if (eligibilityCriteria.maxLandAcres !== undefined) {
      if (landAcres > eligibilityCriteria.maxLandAcres) landPassed = false;
      reqMsg.push(`<= ${eligibilityCriteria.maxLandAcres}`);
    }
    if (eligibilityCriteria.minLandAcres !== undefined) {
      if (landAcres < eligibilityCriteria.minLandAcres) landPassed = false;
      reqMsg.push(`>= ${eligibilityCriteria.minLandAcres}`);
    }
    addResult(
      'Land Area Limits',
      landPassed,
      landAcres,
      reqMsg.join(' and '),
      landPassed ? `Land area ${landAcres} acres is within limits ✓` : `Land area ${landAcres} acres outside required limits ✗`,
      15
    );
  }

  // RULE 3: Annual income check (Weight: 20)
  if (eligibilityCriteria.maxAnnualIncome !== undefined) {
    const incPassed = (annualIncome || 0) <= eligibilityCriteria.maxAnnualIncome;
    addResult(
      'Maximum Annual Income',
      incPassed,
      annualIncome || 0,
      `<= ${eligibilityCriteria.maxAnnualIncome}`,
      incPassed ? `Income within limits ✓` : `Income exceeds maximum allowed ✗`,
      20
    );
  }

  // RULE 4: Caste category check (Weight: 10)
  if (eligibilityCriteria.allowedCasteCategories && eligibilityCriteria.allowedCasteCategories.length > 0) {
    const castePassed = eligibilityCriteria.allowedCasteCategories.includes(personalDetails?.casteCategory);
    addResult(
      'Caste Category',
      castePassed,
      personalDetails?.casteCategory || 'None',
      eligibilityCriteria.allowedCasteCategories.join(', '),
      castePassed ? `Category allowed ✓` : `Category not eligible ✗`,
      10
    );
  }

  // RULE 5: Crop type check (Weight: 15)
  if (eligibilityCriteria.allowedCrops && eligibilityCriteria.allowedCrops.length > 0 && !eligibilityCriteria.allowedCrops.includes('all')) {
    const crops = [landDetails?.primaryCrop?.toLowerCase(), landDetails?.secondaryCrop?.toLowerCase()].filter(Boolean);
    const allowed = eligibilityCriteria.allowedCrops.map(c => c.toLowerCase());
    const cropPassed = crops.some(c => allowed.includes(c));
    addResult(
      'Crop Type',
      cropPassed,
      crops.join(', '),
      eligibilityCriteria.allowedCrops.join(', '),
      cropPassed ? `Cultivated crops match requirements ✓` : `Required crops not cultivated ✗`,
      15
    );
  }

  // RULE 6: Age check (Weight: 10)
  if (personalDetails?.dateOfBirth && (eligibilityCriteria.minAge !== undefined || eligibilityCriteria.maxAge !== undefined)) {
    const age = Math.floor((new Date() - new Date(personalDetails.dateOfBirth).getTime()) / 3.15576e10);
    let agePassed = true;
    let reqMsg = [];
    if (eligibilityCriteria.minAge !== undefined) {
      if (age < eligibilityCriteria.minAge) agePassed = false;
      reqMsg.push(`>= ${eligibilityCriteria.minAge}`);
    }
    if (eligibilityCriteria.maxAge !== undefined) {
      if (age > eligibilityCriteria.maxAge) agePassed = false;
      reqMsg.push(`<= ${eligibilityCriteria.maxAge}`);
    }
    addResult(
      'Age Limits',
      agePassed,
      age,
      reqMsg.join(' and '),
      agePassed ? `Age ${age} is within limits ✓` : `Age ${age} outside required limits ✗`,
      10
    );
  }

  // RULE 7: State / district check (Weight: 5)
  if (eligibilityCriteria.allowedStates && eligibilityCriteria.allowedStates.length > 0) {
    const statePassed = eligibilityCriteria.allowedStates.includes(address?.state);
    addResult(
      'State Match',
      statePassed,
      address?.state || 'None',
      eligibilityCriteria.allowedStates.join(', '),
      statePassed ? `State is eligible ✓` : `Scheme not available in this state ✗`,
      5
    );
  }

  // RULE 8: Land type check (Weight: 5)
  if (eligibilityCriteria.requiredLandType && eligibilityCriteria.requiredLandType.length > 0) {
    const ltPassed = eligibilityCriteria.requiredLandType.includes(landDetails?.landType);
    addResult(
      'Required Land Type',
      ltPassed,
      landDetails?.landType || 'None',
      eligibilityCriteria.requiredLandType.join(', '),
      ltPassed ? `Land type matches ✓` : `Land type does not match ✗`,
      5
    );
  }

  // RULE 9: Custom rules (Weight: up to 20 total, divided)
  if (eligibilityCriteria.customRules && eligibilityCriteria.customRules.length > 0) {
    const customWeightPerRule = 20 / eligibilityCriteria.customRules.length;
    
    eligibilityCriteria.customRules.forEach((rule, idx) => {
      const farmerVal = resolvePath(farmer, rule.field);
      let passed = false;
      
      switch (rule.operator) {
        case 'eq': passed = farmerVal === rule.value; break;
        case 'neq': passed = farmerVal !== rule.value; break;
        case 'gt': passed = farmerVal > rule.value; break;
        case 'gte': passed = farmerVal >= rule.value; break;
        case 'lt': passed = farmerVal < rule.value; break;
        case 'lte': passed = farmerVal <= rule.value; break;
        case 'in': passed = Array.isArray(rule.value) && rule.value.includes(farmerVal); break;
        case 'nin': passed = Array.isArray(rule.value) && !rule.value.includes(farmerVal); break;
      }
      
      addResult(
        `Custom Rule: ${rule.field}`,
        passed,
        farmerVal,
        `${rule.operator} ${rule.value}`,
        passed ? `Rule satisfied ✓` : `Rule failed ✗`,
        customWeightPerRule,
        false // Custom rules do NOT strictly fail eligibility by default unless specified
      );
    });
  }

  const finalScore = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
  const isEligible = mandatoryFailed.length === 0;

  return {
    isEligible,
    score: Math.round(finalScore),
    criteriaResults,
    summary: {
      totalCriteria: criteriaResults.length,
      passedCriteria: criteriaResults.filter(r => r.passed).length,
      failedCriteria: criteriaResults.filter(r => !r.passed).length,
      mandatoryFailed,
    },
    evaluatedAt: new Date()
  };
}

module.exports = { evaluateEligibility };
