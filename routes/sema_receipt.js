const express = require('express');
const router = express.Router();
const Receipt = require(`${__basedir}/models`).receipt;
const ReceiptLineItem = require(`${__basedir}/models`).receipt_line_item;
const { Sequelize } = require(`${__basedir}/models`);
const { Op } = Sequelize;
const semaLog = require(`${__basedir}/seama_services/sema_logger`);
const moment = require('moment-timezone');

const getPaymentType = receipt => {
    if (receipt.amount_cash > 0) {
        if (receipt.amount_loan > 0) {
            return 'Cash/Loan';
        }
        return 'Cash';
    } else if (receipt.amount_mobile) {
        if (receipt.amount_loan > 0) {
            return 'Mobile/Loan';
        }
        return 'Mobile';
    } else if (receipt.amount_card) {
        if (receipt.amount_loan > 0) {
            return 'Card/Loan';
        }
        return 'Card';
    }
};

router.get('/', async (req, res) => {
    const {
        siteId,
        beginDate,
        endDate
    } = req.query;

    let [err, receipts] = await __hp(Receipt.findAll({
        where: {
            kiosk_id: siteId,
            id: {
                [Op.gte]: moment.tz(beginDate, moment.tz.guess()).format(),
                [Op.lte]: moment.tz(endDate, moment.tz.guess()).format()
			}
        }
    }));

    // On error, return a generic error message and log the error
	if (err) {
		semaLog.warn(`sema_sales_dataset - Fetch - Error: ${JSON.stringify(err)}`);
		return res.status(500).json({ msg: "Internal Server Error" });
    }

    receipts = receipts.map(receipt => {
        let receiptCopy = JSON.parse(JSON.stringify(receipt));

        receiptCopy.total_price = receipt.total;
        receiptCopy.total_cogs = receipt.cogs;
        receiptCopy.payment_type = getPaymentType(receipt);
        return receiptCopy;
    });


    let [err1, receiptLineItems] = await __hp(ReceiptLineItem.findAll({
        where: {
            receipt_id: receipts.map(receipt => {
                let receiptId = receipt.id;
                return receiptId;
            })
        }
    }));

    // On error, return a generic error message and log the error
	if (err1) {
		semaLog.warn(`sema_sales_dataset - Fetch - Error: ${JSON.stringify(err1)}`);
		return res.status(500).json({ msg: "Internal Server Error" });
    }

    receiptLineItems = receiptLineItems.map(lineItem => {
        let parentReceipt = receipts.find(receipt => {
            return receipt.id === lineItem.receipt_id;
        }) || null;

        // If we can't find the parent receipt, there's something wrong with this line item
        if (!parentReceipt) {
            return null;
        }

        let lineItemCopy = JSON.parse(JSON.stringify(lineItem));

        lineItemCopy.customer_account_id = parentReceipt.customer_account_id;
        lineItemCopy.total_price = lineItem.price_total;
        lineItemCopy.payment_type = parentReceipt.payment_type;
        lineItemCopy.total_cogs = lineItem.cogs_total;
        // TODO: Calculate this client side
        lineItemCopy.unit_price = lineItem.price_total / lineItem.quantity;

        return lineItemCopy;
    }).filter(lineItem => lineItem); // Filter out line items that don't have a parent receipt

    return res.json([...receipts, ...receiptLineItems]);
});

module.exports = router;