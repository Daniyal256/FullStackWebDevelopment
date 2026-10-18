import Student from './Student.js';
import { calculateAverage, calculateGPA, calculateGrade as gradeOf } from './gradeUtils.js';
export function processTranscripts(rawData) {
  if (typeof rawData !== 'string') throw new TypeError('Input must be a JSON string');
  let data;
  try { data = JSON.parse(rawData); } catch { throw new SyntaxError('Malformed JSON transcript'); }
  if (!Array.isArray(data)) throw new TypeError('Transcript root must be an array');
  const seen = new Set();
  const students = data.map(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new TypeError('Student must be an object');
    if (!Number.isInteger(item.id) || item.id <= 0) throw new TypeError('Missing or invalid student ID');
    if (seen.has(item.id)) throw new Error(`Duplicate student ID: ${item.id}`);
    seen.add(item.id);
    if (typeof item.name !== 'string' || !item.name.trim()) throw new TypeError('Missing student name');
    if (!Array.isArray(item.courses) || item.courses.length === 0) throw new RangeError('Student needs at least one course');
    const courseCodes = new Set();
    item.courses.forEach(course => {
      if (!course || typeof course !== 'object' || Array.isArray(course)) throw new TypeError('Invalid course object');
      if (typeof course.code !== 'string' || !course.code.trim()) throw new TypeError('Missing course code');
      if (courseCodes.has(course.code)) throw new Error(`Duplicate course code: ${course.code}`);
      courseCodes.add(course.code);
      if (typeof course.marks !== 'number' || !Number.isFinite(course.marks) || course.marks < 0 || course.marks > 100) throw new RangeError(`Invalid marks for ${course.code}`);
    });
    const student = new Student(item.id, item.name, item.courses);
    return { id: student.id, name: student.name,
      courses: student.courses.map(course => ({ ...course, grade: gradeOf(course.marks) })),
      average: Number(calculateAverage(student.courses).toFixed(2)), gpa: calculateGPA(student.courses) };
  });
  const report = { totalStudents: students.length, students };
  return { report, json: JSON.stringify(report, null, 2) };
}
