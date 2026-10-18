// Task 1 — Admission Decision and Data Sanitization
const applicants = [
  { id: 'A101', name: 'Sara Khan', age: '19', matricMarks: '91', intermediateMarks: '87', entryTest: '78', program: 'BSCS', feePaid: 'true' },
  { id: 'A102', name: 'Ahmed Ali', age: 'twenty', matricMarks: '88', intermediateMarks: '', entryTest: '72', program: 'BSSE', feePaid: 'false' },
  { id: 'A103', name: 'Hassan', age: '18', matricMarks: '76', intermediateMarks: '83', entryTest: '91', program: 'BSAI', feePaid: 'true' }
];
const PROGRAMS = ['BSCS', 'BSSE', 'BSAI'];

function parseNumber(value, field, errors) {
  if (value === null || value === undefined || String(value).trim() === '') {
    errors.push(`${field} is missing`);
    return null;
  }
  const number = Number(value);
  if (!Number.isFinite(number)) {
    errors.push(`${field} is not a valid number`);
    return null;
  }
  return number;
}

function inRange(number, min, max, field, errors) {
  if (number !== null && (number < min || number > max)) errors.push(`${field} must be ${min}-${max}`);
}

function processApplicant(applicant) {
  const errors = [];
  if (!applicant || typeof applicant !== 'object' || Array.isArray(applicant)) {
    return { id: null, status: 'INVALID DATA', errors: ['Applicant must be an object'] };
  }
  if (typeof applicant.id !== 'string' || !applicant.id.trim()) errors.push('Invalid ID');
  if (typeof applicant.name !== 'string' || !applicant.name.trim()) errors.push('Invalid name');

  const age = parseNumber(applicant.age, 'age', errors);
  const matric = parseNumber(applicant.matricMarks, 'matricMarks', errors);
  const intermediate = parseNumber(applicant.intermediateMarks, 'intermediateMarks', errors);
  const entry = parseNumber(applicant.entryTest, 'entryTest', errors);

  inRange(age, 17, 30, 'age', errors);
  if (age !== null && !Number.isInteger(age)) errors.push('Age must be an integer');
  inRange(matric, 0, 100, 'matricMarks', errors);
  inRange(intermediate, 0, 100, 'intermediateMarks', errors);
  inRange(entry, 0, 100, 'entryTest', errors);
  
  if (!PROGRAMS.includes(applicant.program)) errors.push('Unsupported program');
  if (applicant.feePaid !== 'true' && applicant.feePaid !== 'false' && applicant.feePaid !== true && applicant.feePaid !== false) errors.push('Invalid feePaid value');
  if (errors.length > 0) return { id: applicant.id ?? null, name: applicant.name ?? null, program: applicant.program ?? null, merit: null, status: 'INVALID DATA', errors };

  const feePaid = applicant.feePaid === true || applicant.feePaid === 'true';
  const merit = matric * 0.2 + intermediate * 0.3 + entry * 0.5;
  const eligible = merit >= 70 && entry >= 60 && intermediate >= 60;
  // Policy: eligible + paid = SELECTED; eligible + unpaid = WAITING; otherwise REJECTED.
  const status = !eligible ? 'REJECTED' : feePaid ? 'SELECTED' : 'WAITING';
  return { id: applicant.id, name: applicant.name, program: applicant.program, age, merit: Number(merit.toFixed(2)), feePaid, status, errors: [] };
}

function summarize(processed) {
  const valid = processed.filter(a => a.status !== 'INVALID DATA');
  const programCounts = Object.fromEntries(PROGRAMS.map(p => [p, 0]));
  processed.forEach(a => { if (Object.hasOwn(programCounts, a.program)) programCounts[a.program]++; });
  const ordered = [...valid].sort((a, b) => b.merit - a.merit);
  return {
    validApplicants: valid.length,
    invalidApplicants: processed.length - valid.length,
    highestMeritApplicant: ordered[0] ?? null,
    lowestMeritApplicant: ordered.at(-1) ?? null,
    averageMerit: valid.length ? Number((valid.reduce((sum, a) => sum + a.merit, 0) / valid.length).toFixed(2)) : null,
    programCounts
  };
}

const tests = [...applicants,
  { id: 'A104', name: 'Boundary', age: '17', matricMarks: '70', intermediateMarks: '70', entryTest: '70', program: 'BSSE', feePaid: 'false' },
  { id: 'A105', name: 'Low Marks', age: '30', matricMarks: '40', intermediateMarks: '60', entryTest: '55', program: 'BSCS', feePaid: 'true' },
  { id: 'A106', name: 'Bad Program', age: '20', matricMarks: '90', intermediateMarks: '90', entryTest: '90', program: 'UNKNOWN', feePaid: 'true' }
];
const output = tests.map(processApplicant);
console.log('Processed applicants:', output);
console.log('Summary:', summarize(output));
console.log('Empty summary:', summarize([]));
