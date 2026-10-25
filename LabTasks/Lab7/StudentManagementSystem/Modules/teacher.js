
let students = [];
let nextId = 1;

const getAll = () => students;

const getById = (id) => {
    const student = students.find(s => s.id === id);

    if (!student) {
        throw { status: 404, message: 'Student not found' };
    }

    return student;
};

const create = (data) => {
    if (typeof data.name !== 'string' || !data.name.trim() ||
        typeof data.className !== 'string' || !data.className.trim()) {
        throw { status: 400, message: 'Name and className required' };
    }

    const student = {
        id: nextId++,
        name: data.name.trim(),
        className: data.className.trim()
    };

    students.push(student);
    return student;
};

const update = (id, data) => {
    const student = getById(id);

    if (data.name !== undefined) {
        if (typeof data.name !== 'string' || !data.name.trim()) {
            throw { status: 400, message: 'Invalid name' };
        }
        student.name = data.name.trim();
    }

    if (data.className !== undefined) {
        if (typeof data.className !== 'string' || !data.className.trim()) {
            throw { status: 400, message: 'Invalid className' };
        }
        student.className = data.className.trim();
    }

    return student;
};

const remove = (id) => {
    const student = getById(id);
    students = students.filter(s => s.id !== id);
    return { message: 'Student deleted', student };
};

module.exports = { getAll, getById, create, update, remove };
