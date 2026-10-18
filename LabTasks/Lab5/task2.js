// Task 2 — Academic Performance Intelligence Engine
const results = [
  { id: 1, name: 'Ali', department: 'CS', course: 'FSWD', marks: 82 },
  { id: 2, name: 'Sara', department: 'CS', course: 'FSWD', marks: 91 },
  { id: 3, name: 'Usman', department: 'SE', course: 'FSWD', marks: 47 },
  { id: 4, name: 'Hina', department: 'AI', course: 'FSWD', marks: 73 },
  { id: 5, name: 'Ahmed', department: 'SE', course: 'FSWD', marks: 64 },
  { id: 6, name: 'Zoya', department: 'AI', course: 'FSWD', marks: 91 }
];
const GRADES = [
  { min: 85, grade: 'A', points: 4.0 }, { min: 80, grade: 'A-', points: 3.7 },
  { min: 75, grade: 'B+', points: 3.3 }, { min: 70, grade: 'B', points: 3.0 },
  { min: 65, grade: 'B-', points: 2.7 }, { min: 60, grade: 'C+', points: 2.3 },
  { min: 50, grade: 'C', points: 2.0 }, { min: 0, grade: 'F', points: 0.0 }
];
function validResult(s) {
  return s && typeof s.name === 'string' && s.name.trim() && typeof s.department === 'string' && s.department.trim() && typeof s.marks === 'number' && Number.isFinite(s.marks) && s.marks >= 0 && s.marks <= 100;
}
function classify(student) {
  if (!validResult(student)) return { ...student, grade: null, status: 'INVALID DATA', gradePoints: null };
  const band = GRADES.find(b => student.marks >= b.min);
  return { ...student, grade: band.grade, status: band.grade === 'F' ? 'FAIL' : 'PASS', gradePoints: band.points };
}
function analyze(source) {
  if (!Array.isArray(source)) throw new TypeError('Results must be an array');
  const processed = source.map(classify);
  const valid = processed.filter(s => s.status !== 'INVALID DATA');
  const ranked = [...valid].sort((a, b) => b.marks - a.marks || a.name.localeCompare(b.name));
  const grouped = {};
  valid.forEach(s => {
    if (!Object.hasOwn(grouped, s.department)) grouped[s.department] = { students: 0, total: 0, highest: -Infinity, passed: 0 };
    const d = grouped[s.department];
    d.students++;
    d.total += s.marks;
    d.highest = Math.max(d.highest, s.marks);
    if (s.status === 'PASS') d.passed++;
  });
  const departmentStats = Object.fromEntries(Object.entries(grouped).map(([department, d]) => [department, {
    students: d.students, average: Number((d.total / d.students).toFixed(2)), highest: d.highest, passed: d.passed
  }]));
  const average = valid.length ? valid.reduce((total, s) => total + s.marks, 0) / valid.length : null;
  return { processed, ranked, departmentStats, queries: {
    firstAbove85: valid.find(s => s.marks > 85) ?? null,
    firstFailedIndex: processed.findIndex(s => s.status === 'FAIL'),
    hasFailure: processed.some(s => s.status === 'FAIL'),
    everyMarkValid: processed.every(s => s.status !== 'INVALID DATA'),
    aboveAverage: average === null ? [] : valid.filter(s => s.marks > average),
    topThreeNames: ranked.slice(0, 3).map(s => s.name)
  }, overallAverage: average, invalidCount: processed.length - valid.length };
}
console.log('Normal:', analyze(results));
console.log('Boundary/new department:', analyze([...results, { id: 7, name: 'Areeba', department: 'DS', course: 'FSWD', marks: 0 },
  { id: 8, name: 'Bilal', department: 'DS', course: 'FSWD', marks: 100 }]));
console.log('Invalid:', analyze([{ id: 9, name: 'Bad', department: 'CS', marks: 101 }]));
console.log('Original remains unchanged:', results[0]);
