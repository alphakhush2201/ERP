import express from 'express';
const router = express.Router();
import {
    getAllStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent
} from '../controllers/studentController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.js';

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.route('/')
    .get(getAllStudents)
    .post(authorizeAdmin, createStudent);

router.route('/:id')
    .get(getStudent)
    .put(authorizeAdmin, updateStudent)
    .delete(authorizeAdmin, deleteStudent);

export default router;