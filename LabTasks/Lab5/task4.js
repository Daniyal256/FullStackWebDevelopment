// Task 4 — University User Hierarchy and Dynamic this
class Person {
  constructor(name, email) {
    if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !email.includes('@')) throw new TypeError('Valid name and email required');
    this.name = name; this.email = email;
  }
  introduce() { return `I am ${this.name} (${this.email}).`; }
}
class Student extends Person {
  constructor(name, email, rollNo, marks) {
    super(name, email);
    if (!Number.isFinite(marks) || marks < 0 || marks > 100) throw new RangeError('Invalid marks');
    this.rollNo = rollNo; this.marks = marks;
  }
  introduce() { return `${super.introduce()} Student roll no: ${this.rollNo}.`; }
  getResult() { return this.marks >= 50 ? 'PASS' : 'FAIL'; }
}
class FacultyMember extends Person {
  constructor(name, email, employeeId, department) {
    super(name, email); this.employeeId = employeeId; this.department = department;
  }
  introduce() { return `${super.introduce()} Faculty member in ${this.department} (ID ${this.employeeId}).`; }
}
const ali = new Student('Ali', 'ali@uni.edu', 'AU101', 82);
const sara = new Student('Sara', 'sara@uni.edu', 'AU102', 0);
const faculty = new FacultyMember('Dr. Hina', 'hina@uni.edu', 'E12', 'CS');
const users = [ali, faculty, sara];
users.forEach(user => console.log(user.introduce()));
console.log('Results:', ali.getResult(), sara.getResult());
console.log('instanceof:', ali instanceof Student, ali instanceof Person, faculty instanceof Student);
const guest = { name: 'Dr. Ahmed', email: 'ahmed@example.com' };
console.log('call:', Person.prototype.introduce.call(guest));
const fn = ali.introduce;
try { console.log('Detached:', fn()); } catch (error) { console.log('Detached fails:', error.message); }
const safeFn = ali.introduce.bind(ali);
console.log('Bound:', safeFn());
try { new Student('Bad', 'bad@uni.edu', 'AU0', 101); } catch (error) { console.log('Invalid:', error.message); }
