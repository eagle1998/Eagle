const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);
router.get('/', authMiddleware, adminMiddleware, orderController.getAllOrders);
router.get('/:id', authMiddleware, adminMiddleware, orderController.getOrderById);
router.patch('/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);
router.delete('/:id', authMiddleware, adminMiddleware, orderController.deleteOrder);

module.exports = router;
