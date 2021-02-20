# Pure Nodejs REST APIs

## Usage
```bash
git clone https://github.com/herudi/pure-node-rest-api.git
cd pure-node-rest-api
npm install
// or
yarn

// run development
npm run dev
// or
yarn dev
```

## Route Available
Base Url : http://localhost:3000/
```js
GET /items                      /* get all items  */
GET /items/:id                  /* get items by id  */
GET /items-search?name=nasi     /* search items by name  */
POST /items                     /* save items  */
PUT /items/:id                  /* update items  */
DELETE /items/id                /* delete items  */
```

## Sample Data Items
```json
{
    "name": "Nasi Goreng",
    "price": 12000,
    "brand": "Nasi"
}
```

## License

[MIT](LICENSE)


