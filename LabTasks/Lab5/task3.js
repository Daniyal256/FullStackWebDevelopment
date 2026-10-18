const student = {
  id: 101, name: 'Ali', marks: 0, scholarship: false,
  address: { city: 'Islamabad', sector: 'F-10' },
  contact: { email: 'ali@university.edu' }
};
const update = { 
  name: 'Ali Khan',
  address: { city: 'Rawalpindi' }, 
  contact: { phone: '03001234567' } 
};
const ALLOWED = ['name', 'marks', 'scholarship', 'address', 'contact'];

function updateProfile(original, changes) {
  if (!original || typeof original !== 'object' || Array.isArray(original)) throw new TypeError('Student must be an object');
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) throw new TypeError('Update must be an object');
  for (const key of Object.keys(changes)) if (!ALLOWED.includes(key)) throw new Error(`Unsupported field: ${key}`);
  if (Object.hasOwn(changes, 'name') && typeof changes.name !== 'string') throw new TypeError('name must be a string');
  if (Object.hasOwn(changes, 'marks') && (typeof changes.marks !== 'number' || !Number.isFinite(changes.marks) || changes.marks < 0 || changes.marks > 100)) throw new RangeError('marks must be 0-100');
  if (Object.hasOwn(changes, 'scholarship') && typeof changes.scholarship !== 'boolean') throw new TypeError('scholarship must be boolean');
  for (const key of ['address', 'contact']) {
    if (Object.hasOwn(changes, key) && (!changes[key] || typeof changes[key] !== 'object' || Array.isArray(changes[key]))) throw new TypeError(`${key} must be an object`);
    if (Object.hasOwn(changes, key) && Object.values(changes[key]).some(v => typeof v !== 'string')) throw new TypeError(`${key} properties must be strings`);
  }
  const { address: addressUpdate = {}, contact: contactUpdate = {}, ...topLevel } = changes;
  const { address: oldAddress = {}, contact: oldContact = {} } = original;
  const result = { ...original, ...topLevel, address: { ...oldAddress, ...addressUpdate }, contact: { ...oldContact, ...contactUpdate } };

  return result;
}

function describe(studentRecord, ...labels) { // rest parameters
  const { name: studentName = 'Unknown', address: { city: homeCity = 'Unknown' } = {} } = studentRecord; 
  const [firstLabel = 'Student'] = labels; // array destructuring
  const sector = studentRecord?.address?.sector ?? 'Not provided'; 

  return { firstLabel, studentName, homeCity, sector };
}

const updated = updateProfile(student, update);
console.log('Original:', student);
console.log('Updated:', updated);
console.log('Destructuring:', describe(updated, 'Profile'));
console.log('Reference checks:', {
  rootSame: student === updated, addressSame: student.address === updated.address, contactSame: student.contact === updated.contact
});

console.log('Boundary (preserve 0, false, empty string):', updateProfile(student, { marks: 0, scholarship: false, name: '' }));
try { updateProfile(student, { marks: 110 }); } catch (error) { console.log('Invalid:', error.message); }
