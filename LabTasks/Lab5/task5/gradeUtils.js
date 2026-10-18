const BANDS = [
  { min: 85, grade: 'A', points: 4 }, { min: 80, grade: 'A-', points: 3.7 },
  { min: 75, grade: 'B+', points: 3.3 }, { min: 70, grade: 'B', points: 3 },
  { min: 65, grade: 'B-', points: 2.7 }, { min: 60, grade: 'C+', points: 2.3 },
  { min: 50, grade: 'C', points: 2 }, { min: 0, grade: 'F', points: 0 }
];
export function calculateGrade(marks) {
  if (typeof marks !== 'number' || !Number.isFinite(marks) || marks < 0 || marks > 100) throw new RangeError('Marks must be between 0 and 100');
  return BANDS.find(band => marks >= band.min).grade;
}
export function calculateAverage(courses) {
  if (!Array.isArray(courses) || courses.length === 0) throw new RangeError('At least one course is required');
  return courses.reduce((sum, course) => sum + course.marks, 0) / courses.length;
}
export function calculateGPA(courses) {
  if (!Array.isArray(courses) || courses.length === 0) throw new RangeError('At least one course is required');
  const points = courses.map(course => BANDS.find(band => course.marks >= band.min).points);
  return Number((points.reduce((sum, value) => sum + value, 0) / points.length).toFixed(2));
}
