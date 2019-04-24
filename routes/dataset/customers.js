const express = require('express');
const router = express.Router();
const CustomerAccount = require(`${__basedir}/models`).customer_account;
const semaLog = require(`${__basedir}/seama_services/sema_logger`);

// Must return a dataset that basically looks like this:
// const results = [
//     {
//         "id": "1",
//         "created_at": "2019-04-17 18:19:35",
//         "updated_at": "2019-04-17 18:19:35",
//         "name": "Nick Rameau",
//         "active": 1
//     },
//     {
//         "id": "2",
//         "created_at": "2019-04-17 18:19:35",
//         "updated_at": "2019-04-17 18:19:35",
//         "name": "Olix Lundi",
//         "active": 1
//     },
//     {
//         "id": "3",
//         "created_at": "2019-04-17 18:19:35",
//         "updated_at": "2019-04-17 18:19:35",
//         "name": "Colls Rameau",
//         "active": 1
//     }
// ];
router.get('/', async (req, res) => {

    const {
        siteId
    } = req.query;

    const [err, customersDataset] = await __hp(CustomerAccount.findAll({
        where: {
            kiosk_id: siteId
        }
    }));

    // On error, return a generic error message and log the error
	if (err) {
		semaLog.warn(`sema_data_export - Fetch - Error: ${JSON.stringify(err)}`);
		return res.status(500).json({ msg: "Internal Server Error" });
    }

    return res.json(customersDataset);
});

module.exports = router;