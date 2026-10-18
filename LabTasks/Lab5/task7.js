// Task 7 — Promise-Based Multi-Service Registration
const students = [{ id: 101, completed: ['CS301'], registered: [] }, { id: 102, completed: [], registered: [] }];
const courses = [{ code: 'CS401', prerequisite: 'CS301', seats: 2 }];
function getStudent(id) {
  return Promise.resolve().then(() => {
    const student = students.find(s => s.id === id);
    if (!student) throw new Error('Student not found');
    return student;
  });
}
function getCourse(code) {
  return Promise.resolve().then(() => {
    const course = courses.find(c => c.code === code);
    if (!course) throw new Error('Course not found');
    return course;
  });
}
function checkPrerequisites(data) {
  return Promise.resolve().then(() => {
    if (data.course.prerequisite && !data.student.completed.includes(data.course.prerequisite)) throw new Error('Prerequisite missing');
    return data;
  });
}
function checkSeats(data) {
  return Promise.resolve().then(() => {
    if (data.course.seats <= 0) throw new Error('No seats available');
    return data;
  });
}
function registerStudent(data) {
  return Promise.resolve().then(() => {
    if (data.student.registered.includes(data.course.code)) throw new Error('Already registered');
    if (data.course.seats <= 0) throw new Error('No seats available');
    // Registration state mutation is explicitly required.
    data.student.registered.push(data.course.code);
    data.course.seats--;
    return { studentId: data.student.id, course: data.course.code, status: 'REGISTERED' };
  });
}
function sendEmail(confirmation) { return Promise.resolve({ service: 'Email', sentTo: confirmation.studentId }); }
function sendSMS() { return Promise.reject(new Error('SMS gateway unavailable')); }
function writeAuditLog(confirmation) { return Promise.resolve({ service: 'Audit', course: confirmation.course }); }
function register(id, code) {
  return getStudent(id)
    .then(student => getCourse(code).then(course => ({ student, course })))
    .then(checkPrerequisites)
    .then(checkSeats)
    .then(registerStudent)
    .then(confirmation => Promise.allSettled([sendEmail(confirmation), sendSMS(confirmation), writeAuditLog(confirmation)])
      .then(outcomes => ({ confirmation, services: outcomes.map((result, i) => ({
        service: ['Email', 'SMS', 'Audit'][i], status: result.status,
        ...(result.status === 'rejected' ? { error: result.reason.message } : {})
      })) })))
    .catch(error => ({ error: error.message, status: 'FAILED' }))
    .finally(() => console.log('Registration attempt finished'));
}
function serverA() { return Promise.reject(new Error('Server A unavailable')); }
function serverB() { return new Promise(resolve => setTimeout(() => resolve({ code: 'CS401', source: 'B' }), 5)); }
function selectFirstSuccessful() { return Promise.any([serverA(), serverB()]); }
// Run tests in order so changed registration state produces predictable outcomes.
register(101, 'CS401')
  .then(result => { console.log('Normal + service failure:', result); return register(101, 'CS401'); })
  .then(result => { console.log('Duplicate:', result); return register(102, 'CS401'); })
  .then(result => { console.log('Prerequisite missing:', result); return register(999, 'CS401'); })
  .then(result => { console.log('Missing student:', result); return selectFirstSuccessful(); })
  .then(result => console.log('First successful server (Promise.any):', result))
  .catch(error => console.error('Unexpected:', error));
