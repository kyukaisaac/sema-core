const express = require('express');
const router = express.Router();
const Receipt = require(`${__basedir}/models`).receipt;
const Product = require(`${__basedir}/models`).product;
const CustomerAccount = require(`${__basedir}/models`).customer_account;
const ReceiptLineItem = require(`${__basedir}/models`).receipt_line_item;
const { Sequelize } = require(`${__basedir}/models`);
const { Op } = Sequelize;
const semaLog = require(`${__basedir}/seama_services/sema_logger`);
const moment = require('moment-timezone');

router.post('/', async (req, res) => {
    console.dir(req.body);

    return res.json({});
});

module.exports = router;