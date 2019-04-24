const express = require('express');
const router = express.Router();
const sales_dataset = require('./sales');
const customers_dataset = require('./customers');

router.use('/sales', sales_dataset);
router.use('/customers', customers_dataset);

module.exports = router;