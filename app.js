const Pure = require("./pure-node/pure");
const { body, validationResult } = require('express-validator');

// fake db
let fakedb = [];

// many developer LOVE express-validator
const validator = [
    body('name').isString(),
    body('price').isNumeric(),
    body('brand').isString(),
    (req, res, next) => {
        const message = validationResult(req);
        if (message.isEmpty()) return next();
        res.status(422).json({
            statusCode: 422,
            errors: message.errors
        });
    }
];

// get index by params id
const getIndex = (id) => {
    let idx = fakedb.findIndex(el => el.id === id);
    if (idx === -1) throw new Error('id not found in fakedb');
    return idx;
}

// initialize app
const app = new Pure();

// pass user to middleware
app.use((req, res, next) => {
    req.user = 'herudi';
    next();
})

// get all items
app.get('/items', (req, res) => {
    res.json({
        statusCode: 200,
        data: fakedb
    });
});

// get items by id
app.get('/items/:id', (req, res) => {
    let idx = getIndex(req.params.id);
    res.json({
        statusCode: 200,
        data: fakedb[idx]
    });
});

// search items by name
app.get('/items-search', (req, res) => {
    let name = req.query.name;
    if (!name) throw new Error('Query name is required');
    let result = fakedb.filter(el => el.name.toLowerCase().indexOf(name) > -1);
    res.json({
        statusCode: 200,
        data: result
    });
});

// save items
app.post('/items', validator, (req, res) => {
    req.body.id = new Date().getTime().toString();
    req.body.userBy = req.user;
    fakedb.push(req.body);
    res.status(201).json({
        statusCode: 201,
        message: 'Success save items'
    });
});

// update items
app.put('/items/:id', validator, (req, res) => {
    let id = req.params.id;
    let idx = getIndex(id);
    fakedb[idx] = { id, userBy: req.user, ...req.body };
    res.json({
        statusCode: 200,
        message: 'Success update items'
    });
});

// delete items
app.delete('/items/:id', (req, res) => {
    let idx = getIndex(req.params.id);
    fakedb.splice(idx, 1);
    res.json({
        statusCode: 200,
        message: 'Success delete items'
    });
});

// error handling (optional)
app.onError((err, req, res, next) => {
    let code = err.code || err.status || err.statusCode || 500;
    if (typeof code !== 'number') code = 500;
    res.status(code).json({
        statusCode: code,
        message: err.message || 'Something went wrong',
    });
});

// not found url error handling (optional)
app.on404((req, res, next) => {
    res.status(404).json({
        statusCode: 404,
        message: `Route ${req.method}${req.url} not found`,
    });
});

// listen port 3000
app.listen(3000, () => {
    console.log('> Running on port ' + 3000);
});