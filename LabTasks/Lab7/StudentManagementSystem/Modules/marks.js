
const students = require('./student');

let marks = [];
let nextId = 1;

const getAll = () => marks;

const getById = (id) => {
    const record = marks.find(m => m.id === id);

    if (!record) {
        throw { status: 404, message: 'Marks not found' };
    }

    return record;
};

const validate = (data) => {
    if (!Number.isInteger(data.studentId) || data.studentId <= 0) {
        throw { status: 400, message: 'Invalid studentId' };
    }

    students.getById(data.studentId);

    if (typeof data.subject !== 'string' || !data.subject.trim()) {
        throw { status: 400, message: 'Subject required' };
    }

    if (typeof data.score !== 'number' ||
        !Number.isFinite(data.score) ||
        data.score < 0 || data.score > 100) {
        throw { status: 400, message: 'Score must be 0 to 100' };
    }
};

const create = (data) => {
    validate(data);

    const record = {
        id: nextId++,
        studentId: data.studentId,
        subject: data.subject.trim(),
        score: data.score
    };

    marks.push(record);
    return record;
};

const update = (id, data) => {
    const record = getById(id);
    const updated = { ...record, ...data };

    validate(updated);

    record.studentId = updated.studentId;
    record.subject = updated.subject.trim();
    record.score = updated.score;

    return record;
};

const remove = (id) => {
    const record = getById(id);
    marks = marks.filter(m => m.id !== id);
    return { message: 'Marks deleted', record };
};

const removeByStudent = (studentId) => {
    marks = marks.filter(m => m.studentId !== studentId);
};

module.exports = {
    getAll, getById, create, update, remove, removeByStudent
};
