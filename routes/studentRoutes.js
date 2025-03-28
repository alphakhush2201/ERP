 import express from 'express';
const router = express.Router();
import {
    getAllStudents,
    getStudent,
    createStudent,
    updateStudent,
    deleteStudent
} from '../controllers/studentController.js';

router.route('/')
    .get(getAllStudents)
    .post(createStudent);

router.route('/:id')
    .get(getStudent)
    .put(updateStudent)
    .delete(deleteStudent);

export default router;