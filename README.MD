# Pure Nodejs REST APIs
Simple REST APIs nodejs without framework.

## Feature
- Support express middleware (multer, express-validator, cors and other.).
- Safe, write code without try and catch block.

## Usage
```bash
git clone https://github.com/herudi/pure-node-rest-api.git
cd pure-node-rest-api
npm install

// run application
npm run start
```

## Route Available
Base Url : http://localhost:3000/
```js
GET /items                      /* get all items  */
GET /items/:id                  /* get items by id  */
GET /items-search?name=nasi     /* search items by name  */
POST /items                     /* save items  */
PUT /items/:id                  /* update items  */
DELETE /items/:id                /* delete items  */
```

## Sample Data Items
```json
{
    "name": "Nasi Goreng",
    "price": 12000,
    "brand": "Nasi"
}
```

> Similar but complete case, fast and small [Baskom.js](https://github.com/herudi/baskom)

## License

[MIT](LICENSE)


