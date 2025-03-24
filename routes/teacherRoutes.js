import express from 'express';
import {
    getAllTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher
} from '../controllers/teacherController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected and require admin access
router.use(authenticateToken, authorizeAdmin);

// Teacher routes
router.route('/')
    .get(getAllTeachers)
    .post(createTeacher);

router.route('/:id')
    .get(getTeacher)
    .put(updateTeacher)
    .delete(deleteTeacher);

export default router; 