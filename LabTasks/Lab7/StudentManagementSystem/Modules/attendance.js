
const students = require('./student');
console.log("Attendance student module:", require.resolve('./student'));
let attendance = [];
let nextId = 1;

const getAll = () => attendance;

const getById = (id) => {
    const record = attendance.find(a => a.id === id);

    if (!record) {
        throw { status: 404, message: 'Attendance not found' };
    }

    return record;
};

const validate = (data) => {
    if (!Number.isInteger(data.studentId) || data.studentId <= 0) {
        throw { status: 400, message: 'Invalid studentId' };
    }

    console.log("Available students:", students.getAll());
    console.log("Requested ID:", data.studentId);
    console.log("ID type:", typeof data.studentId);

    students.getById(data.studentId);

    if (typeof data.date !== 'string' ||
        !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
        Number.isNaN(Date.parse(data.date)) ||
        new Date(data.date).toISOString().slice(0, 10) !== data.date) {
        throw { status: 400, message: 'Invalid date (YYYY-MM-DD)' };
    }

    if (!['present', 'absent', 'late'].includes(data.status)) {
        throw { status: 400, message: 'Invalid attendance status' };
    }
};

const create = (data) => {
    validate(data);

    const record = {
        id: nextId++,
        studentId: data.studentId,
        date: data.date,
        status: data.status
    };

    attendance.push(record);
    return record;
};

const update = (id, data) => {
    const record = getById(id);
    const updated = { ...record, ...data };

    validate(updated);

    record.studentId = updated.studentId;
    record.date = updated.date;
    record.status = updated.status;

    return record;
};

const remove = (id) => {
    const record = getById(id);
    attendance = attendance.filter(a => a.id !== id);
    return { message: 'Attendance deleted', record };
};

const removeByStudent = (studentId) => {
    attendance = attendance.filter(a => a.studentId !== studentId);
};

module.exports = {
    getAll, getById, create, update, remove, removeByStudent
};
