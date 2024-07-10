const fs = require('node:fs');

const express = require('express');

const app = express();
const PORT = 3100;

const getParseData = () => {
    return JSON.parse(fs.readFileSync('./users.json', 'utf8'));
};

const validatorUsers = (req, res) => {
    const users = getParseData();
    const { username, email, phone } = req.body;
    const indexEmail = users.findIndex((user) => user.email === email);
    const indexUserName = users.findIndex((user) => user.username === username);
    const indexPhone = users.findIndex((user) => user.phone === phone);
    if (indexUserName !== -1) {
        return res.status(409).json('User with this username already exists');
    }
    if (indexEmail !== -1) {
        return res.status(409).json('User with this email already exists');
    }
    if (indexPhone !== -1) {
        return res.status(409).json('User with this phone already exists');
    }
    return users;
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/users', (req, res) => {
    try {
        const users = getParseData();
        res.json(users);
        console.log('Get all users successfully,', `status code: ${res.statusCode}`);
    } catch (e) {
        res.status(400).json(e.message);
        console.error(e.message, res.statusCode);
    }
});

app.post('/users', (req, res) => {
    try {
        const users = validatorUsers(req, res);
        const { name, username, email, phone } = req.body;
        const newUser = {
            id: users.length ? users[users.length - 1].id + 1 : 1,
            name,
            username,
            email,
            phone
        };
        users.push(newUser);
        fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));
        res.status(201).json(newUser);
        console.log('User created,', `status code: ${res.statusCode}`);
    } catch (e) {
        res.status(400).json({ error: e.message });
        console.error(e.message, res.statusCode);
    }
});

app.put('/users/:id', (req, res) => {
    try {
        const users = validatorUsers(req, res);
        const id = +req.params.id;
        const { name, username, email, phone } = req.body;
        const user = users.find(user => user.id === id);
        if (!user) {
            return res.status(404).json('User not found');
        }
        if (name) user.name = name;
        if (username) user.username = username;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));
        res.status(200).json(user);
    } catch (e) {
        res.status(400).json({ error: e.message });
        console.error(e.message, res.statusCode);
    }
});

app.delete('/users/:id', (req, res) => {
    try {
        const users = getParseData();
        const id = +req.params.id;
        const userIndex = users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            return res.status(404).json('User not found');
        }
        users.splice(userIndex, 1);
        fs.writeFileSync('./users.json', JSON.stringify(users, null, 2));
        res.status(204).json('User deleted successfully');
        console.log('User deleted successfully,', `status code: ${res.statusCode}`);
    } catch (e) {
        res.status(400).json({ error: e.message });
        console.error(e.message, res.statusCode);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
