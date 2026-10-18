// Task 6 — Callback-Based Registration (no Promises or async/await)
const students = [{ id: 101, completed: ['CS301'], registered: [] }, { id: 102, completed: [], registered: [] }];
const courses = [{ code: 'CS401', prerequisite: 'CS301', seats: 2 }, { code: 'CS402', prerequisite: null, seats: 0 }];
function loadStudent(id, callback) {
  setTimeout(() => {
    const student = students.find(s => s.id === id);
    if (!student) return callback(new Error('Student does not exist'), null);
    callback(null, student);
  }, 5);
}
function checkPrerequisites(student, courseCode, callback) {
  setTimeout(() => {
    const course = courses.find(c => c.code === courseCode);
    if (!course) return callback(new Error('Course does not exist'), null);
    if (course.prerequisite !== null && !student.completed.includes(course.prerequisite)) return callback(new Error('Prerequisite not completed'), null);
    callback(null, { student, course });
  }, 5);
}
function checkAvailableSeats(data, callback) {
  setTimeout(() => {
    if (data.course.seats <= 0) return callback(new Error('Course is full'), null);
    callback(null, data);
  }, 5);
}
function registerCourse(data, callback) {
  setTimeout(() => {
    const { student, course } = data;
    if (student.registered.includes(course.code)) return callback(new Error('Student already registered'), null);
    if (course.seats <= 0) return callback(new Error('Course is full'), null);
    // Registration explicitly requires mutation of registration state.
    course.seats--;
    student.registered.push(course.code);
    callback(null, { studentId: student.id, course: course.code, status: 'REGISTERED' });
  }, 5);
}
function startRegistration(id, courseCode, done) {
  loadStudent(id, (error, student) => {
    if (error) return done(error, null);
    checkPrerequisites(student, courseCode, (error, data) => {
      if (error) return done(error, null);
      checkAvailableSeats(data, (error, available) => {
        if (error) return done(error, null);
        registerCourse(available, done);
      });
    });
  });
}
function showResult(label, error, value) { console.log(label, error ? error.message : value); }
startRegistration(101, 'CS401', (error, value) => showResult('Normal', error, value));
startRegistration(999, 'CS401', (error, value) => showResult('Missing student', error, value));
startRegistration(102, 'CS401', (error, value) => showResult('Missing prerequisite', error, value));
startRegistration(101, 'CS402', (error, value) => showResult('Full course', error, value));
// After the first registration succeeds, a second attempt must fail as already registered.
setTimeout(() => startRegistration(101, 'CS401', (error, value) => showResult('Already registered', error, value)), 50);
