const express = require('express');
const productController = require('../controllers/productController');
const AdminAuthCheck = require('../middleware/AdminAuthCheck');
const AuthCheck = require('../middleware/AuthCheck');
const router = express.Router();
const upload = require('../utils/fileupload')

router.post('/create-product',AuthCheck,AdminAuthCheck,upload.array('images', 5),productController.createProduct);
router.get('/All-product',productController.getProduct);
router.put('/update-product/:id',AuthCheck,AdminAuthCheck,upload.array('images', 5),productController.updateProduct);
router.delete('/delete-product/:id',AuthCheck,AdminAuthCheck,upload.array('images', 5),productController.deleteProduct);  

module.exports = router;