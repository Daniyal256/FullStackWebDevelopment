import Student from './Student.js'; // default import
import { calculateGrade as gradeFor, calculateAverage, calculateGPA } from './gradeUtils.js'; // named and alias imports
import { processTranscripts } from './transcriptService.js';
const normal = JSON.stringify([{ id: 101, name: 'Ali', courses: [{ code: 'CS301', marks: 81 }, { code: 'CS302', marks: 74 }] }]);
const boundary = JSON.stringify([{ id: 102, name: 'Sara', courses: [{ code: 'CS101', marks: 0 }, { code: 'CS102', marks: 100 }] }]);
const invalid = [
  '{ broken json',
  JSON.stringify([{ name: 'Missing ID', courses: [{ code: 'C1', marks: 75 }] }]),
  JSON.stringify([{ id: 1, name: 'A', courses: [{ code: 'C', marks: 70 }] }, { id: 1, name: 'B', courses: [{ code: 'C', marks: 70 }] }]),
  JSON.stringify([{ id: 3, name: 'Bad', courses: [{ code: '', marks: 100 }] }]),
  JSON.stringify([{ id: 4, name: 'Bad', courses: [{ code: 'CS', marks: -1 }] }])
];
function test(label, raw) {
  try { console.log(label, processTranscripts(raw)); }
  catch (error) { console.log(label, `${error.name}: ${error.message}`); }
  finally { console.log(`Finished ${label}`); }
}
console.log('Direct module usage:', new Student(100, 'Demo', [{ code: 'X', marks: 85 }]).name, gradeFor(85), calculateAverage([{ marks: 50 }]), calculateGPA([{ marks: 50 }]));
test('Normal', normal);
test('Boundary', boundary);
invalid.forEach((raw, index) => test(`Invalid ${index + 1}`, raw));
