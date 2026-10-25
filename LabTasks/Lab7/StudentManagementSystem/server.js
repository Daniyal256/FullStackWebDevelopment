
const http = require('node:http');

const students = require('./Modules/student');
const teachers = require('./Modules/teacher');
const attendance = require('./Modules/attendance');
const marks = require('./Modules/marks');
console.log("Server student module:", require.resolve('./Modules/student'));
console.log("Server teacher module:", require.resolve('./Modules/teacher'));
console.log("Server attendance module:", require.resolve('./Modules/attendance'));
console.log("Server marks module:", require.resolve('./Modules/marks'));

const server = http.createServer(async (req, res) => {
    const send = (status, body) => {
        res.writeHead(status, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify(body));
    };

    const url = new URL(req.url, 'http://localhost:3004');
    const parts = url.pathname.split('/').filter(Boolean);

    const moduleName = parts[0];
    const id = parts[1] ? Number(parts[1]) : null;

    const modules = {
        students,
        teachers,
        attendance,
        marks
    };

    const module = modules[moduleName];

    if (!module || parts.length > 2 ||
        (parts[1] && (!Number.isInteger(id) || id <= 0))) {
        return send(404, { error: 'Invalid endpoint' });
    }

    let data = {};

    if (req.method === 'POST' || req.method === 'PUT') {
        try {
            let raw = '';

            for await (const chunk of req) {
                raw += chunk;

                if (Buffer.byteLength(raw) > 65536) {
                    return send(413, { error: 'Too large' });
                }
            }

            data = JSON.parse(raw);

            if (!data || typeof data !== 'object' ||
                Array.isArray(data)) {
                return send(400, { error: 'Invalid data' });
            }
        } catch (error) {
            return send(400, { error: 'Invalid JSON' });
        }
    }

    try {
        if (req.method === 'GET') {
            return send(200, id ? module.getById(id) : module.getAll());
        }

        if (req.method === 'POST' && id === null) {
            return send(201, module.create(data));
        }

        if (req.method === 'PUT' && id !== null) {
            return send(200, module.update(id, data));
        }

        // if (req.method === 'DELETE' && id !== null) {
        //     return send(200, module.remove(id));
        // }

        if (req.method === 'DELETE' && id !== null) {
            const result = module.remove(id);

            if (moduleName === 'students') {
                attendance.removeByStudent(id);
                marks.removeByStudent(id);
            }

            return send(200, result);
        }


        return send(405, { error: 'Method not allowed' });
    } catch (error) {
        return send(error.status || 500, {
            error: error.status ? error.message : 'Server error'
        });
    }
});

server.listen(3004, () => {
    console.log('Server running at http://localhost:3004');
});
