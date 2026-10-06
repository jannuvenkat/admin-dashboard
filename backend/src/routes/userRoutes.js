const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const { validateRequiredFields } = require('../middleware/validationMiddleware');

router.use(protect, adminOnly);

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', validateRequiredFields(['name', 'email', 'password']), userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
