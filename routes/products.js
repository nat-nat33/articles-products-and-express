var express = require('express');
var router = express.Router();

var validateBody = require('../lib/middleware/validateBody');

router.get('/:id/edit', function(req, res) {
  req.conn.query('SELECT * FROM products WHERE id = $1', req.params.id)
    .then(function(product) {
      res.render('edit', {
        title: product.name,
        editItem: product[0],
        redirect: '/products/'+req.params.id
      });
    });
});

router.get('/new', function(req, res) {
  req.conn.query("SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'products'")
    .then(function(column_names) {
      console.log(column_names);
      res.render('new', {
        title: "Products",
        redirect: '/products',
        inputs: column_names //[ 'name', 'price', 'inventory']
      });
    });
});

router.route('/:id')
  .put(validateBody({'name' : 'string', 'price': 'string',
   'inventory': 'number'}), function(req, res) {
    req.conn.query('UPDATE products SET name = $1, price = $2,' +
      ' inventory = $3 WHERE id = $4',
      [req.body.name, req.body.price, req.body.inventory, req.params.id])
      .then(function() {
        res.json({ success: true, redirect : '/products'});
      })
      .catch(function(error) {
        res.json({ success: false, errors: {}});
      });
  })
  .delete(function(req, res) {
    req.conn.query('DELETE FROM products WHERE id = $1', req.params.id)
      .then(function() {
        res.json({success : true});
      })
      .catch(function(err) {
        res.json({success : false});
      });
  });

router.route('/')
  .post(validateBody({'name' : 'string', 'price': 'string',
    'inventory': 'number'}),function(req, res) {
    req.conn.query('INSERT INTO products (name, price, inventory)' +
      'VALUES ($1, $2, $3)', [req.body.name, req.body.price,
      req.body.inventory])
      .then(function() {
        res.json({ success: true, redirect : '/products'});
      })
      .catch(function(err) {
        res.json({ success: false, errors: {}});
      });
  })
  .get(function(req, res) {
    req.conn.query('SELECT * FROM products')
      .then(function(products) {
        res.render('productIndex', { title: 'Products', list: products});
      });
  });


module.exports = router;