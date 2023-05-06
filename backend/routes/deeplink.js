const express = require('express');
const router = express.Router();

router.use(function (req, res) {
	console.log(req.originalUrl.replace("/deeplink/", ""));
	res.redirect(req.originalUrl.replace("/deeplink/", ""));
	res.end();
});

module.exports = router;