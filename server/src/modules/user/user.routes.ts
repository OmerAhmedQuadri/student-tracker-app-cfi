import { Router } from 'express';
import * as userController from './user.controller';
import { protect, admin } from '../auth/auth.middleware';

const router = Router();

router.route('/')
  .get(protect, admin, userController.getUsers)
  .post(protect, admin, userController.createUser);

router.route('/:id')
  .get(protect, userController.getUserById)
  .put(protect, userController.updateUser)
  .delete(protect, admin, userController.deleteUser);

export default router;
