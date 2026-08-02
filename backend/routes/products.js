const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { productImageUpload } = require('../middleware/upload');
const productController = require('../controllers/productController');

router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeatured);
router.get('/manage', authMiddleware, adminMiddleware, productController.getAllProductsAdmin);
router.post('/upload', authMiddleware, adminMiddleware, productImageUpload, productController.uploadProductImage);
router.get('/:id', productController.getProductById);
router.get('/slug/:slug', productController.getProductBySlug);
router.post('/', authMiddleware, adminMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

module.exports = router;
