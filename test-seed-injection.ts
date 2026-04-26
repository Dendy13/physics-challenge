import { generateQuestions, type GenerateProps } from "./src/lib/generator";

console.log("=== Testing Seed Injection System ===\n");

// Test 1: Generate questions with same seed should produce identical results
console.log("Test 1: Deterministic generation with same seed");
const testSeed = "test-seed-123";
const props1: GenerateProps = {
  seed: testSeed,
  mode: "simbol",
  difficulty: "easy",
  count: 5,
  bab: "mekanika",
  subBab: "vektor",
};

const questions1 = generateQuestions(props1);
const questions2 = generateQuestions(props1);

console.log(`First generation (${questions1.length} questions):`);
questions1.slice(0, 2).forEach((q) => {
  console.log(`  - ${q.id}: ${q.question}`);
});

console.log(`\nSecond generation (${questions2.length} questions):`);
questions2.slice(0, 2).forEach((q) => {
  console.log(`  - ${q.id}: ${q.question}`);
});

// Check if they're identical
let identical = true;
if (questions1.length !== questions2.length) {
  identical = false;
  console.log("\n❌ FAIL: Different number of questions!");
} else {
  for (let i = 0; i < questions1.length; i++) {
    if (
      questions1[i].question !== questions2[i].question ||
      questions1[i].correctAnswer !== questions2[i].correctAnswer
    ) {
      identical = false;
      console.log(`\n❌ FAIL: Questions differ at index ${i}`);
      break;
    }
  }
}

if (identical) {
  console.log("\n✅ PASS: Both generations are identical!");
}

// Test 2: Different seeds should produce different questions
console.log("\n\nTest 2: Different seeds produce different questions");
const testSeed2 = "different-seed-456";
const props2: GenerateProps = {
  ...props1,
  seed: testSeed2,
};

const questions3 = generateQuestions(props2);
console.log(`Generation with different seed (${questions3.length} questions):`);
questions3.slice(0, 2).forEach((q) => {
  console.log(`  - ${q.id}: ${q.question}`);
});

let different = false;
for (let i = 0; i < Math.min(questions1.length, questions3.length); i++) {
  if (
    questions1[i].question !== questions3[i].question ||
    questions1[i].correctAnswer !== questions3[i].correctAnswer
  ) {
    different = true;
    break;
  }
}

if (different) {
  console.log("\n✅ PASS: Different seeds produce different questions!");
} else {
  console.log("\n❌ FAIL: Questions are identical with different seeds!");
}

// Test 3: Test with all categories
console.log("\n\nTest 3: Generator works with all categories");
const categories = ["mekanika", "energi", "fluida", "listrik", "modern"] as const;

categories.forEach((bab) => {
  const categoryProps: GenerateProps = {
    seed: "category-test",
    mode: "teks",
    difficulty: "medium",
    count: 3,
    bab,
    subBab: "all",
  };

  const catQuestions = generateQuestions(categoryProps);
  console.log(`  ${bab}: ${catQuestions.length} questions generated`);

  if (catQuestions.length === 0) {
    console.log(`    ❌ ERROR: No questions generated for ${bab}`);
  }
});

console.log("\n✅ Seed Injection System Test Complete!");
