import Student from '../models/Student.js';
import logger from '../config/logger.js';

// Get all students with pagination, search and filtering
export const getAllStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const grade = req.query.grade || '';
        
        // Build where clause for filtering
        const whereClause = {};
        
        // Add search functionality
        if (search) {
            whereClause[Symbol.for('or')] = [
                { firstName: { [Symbol.for('like')]: `%${search}%` } },
                { lastName: { [Symbol.for('like')]: `%${search}%` } },
                { parentName: { [Symbol.for('like')]: `%${search}%` } },
                { parentPhone: { [Symbol.for('like')]: `%${search}%` } },
                { parentEmail: { [Symbol.for('like')]: `%${search}%` } }
            ];
        }
        
        // Add grade filter
        if (grade) {
            whereClause.grade = grade;
        }
        
        // Get total count for pagination
        const count = await Student.count({ where: whereClause });
        
        // Get students with pagination
        const students = await Student.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });
        
        res.status(200).json({
            success: true,
            data: students,
            total: count,
            page,
            totalPages: Math.ceil(count / limit)
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