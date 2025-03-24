import Student from '../models/Student.js';
import logger from '../config/logger.js';

// Get all students
export const getAllStudents = async (req, res) => {
    try {
        const students = await Student.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({
            success: true,
            data: students
        });
    } catch (error) {
        logger.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Get single student
export const getStudent = async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        logger.error('Error fetching student:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// Create new student
export const createStudent = async (req, res) => {
    try {
        const student = await Student.create(req.body);
        
        res.status(201).json({
            success: true,
            data: student
        });
    } catch (error) {
        logger.error('Error creating student:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Update student
export const updateStudent = async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        await student.update(req.body);
        
        res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        logger.error('Error updating student:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Delete student
export const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                error: 'Student not found'
            });
        }

        await student.destroy();
        
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        logger.error('Error deleting student:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}; 