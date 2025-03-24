import { Teacher } from '../models/Teacher.js';
import { User } from '../models/User.js';
import bcrypt from 'bcrypt';
import logger from '../config/logger.js';

// Get all teachers
export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.findAll({
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role', 'status', 'subjects', 'qualification', 'experience', 'salary']
        });
        res.status(200).json({ success: true, data: teachers });
    } catch (error) {
        logger.error('Error fetching teachers:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Failed to fetch teachers',
            details: error.errors?.map(e => e.message) || []
        });
    }
};

// Get single teacher
export const getTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByPk(req.params.id);
        
        if (!teacher) {
            return res.status(404).json({
                success: false,
                error: 'Teacher not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: teacher
        });
    } catch (error) {
        logger.error('Error fetching teacher:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server Error',
            details: error.errors?.map(e => e.message) || []
        });
    }
};

// Create a new teacher
export const createTeacher = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            gender,
            qualification,
            role,
            subjects,
            experience,
            salary,
            status = 'active'
        } = req.body;

        // First create a user account for the teacher
        const hashedPassword = await bcrypt.hash('Master@Teacher', 10);
        const user = await User.create({
            email,
            password: hashedPassword,
            role: 'TEACHER',
            mustChangePassword: true
        });

        // Then create the teacher profile
        const teacher = await Teacher.create({
            userId: user.id,
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            gender,
            qualification,
            role,
            subjects: Array.isArray(subjects) ? subjects : [subjects],
            experience,
            salary,
            status
        });

        res.status(201).json({
            success: true,
            message: 'Teacher created successfully',
            data: teacher
        });

    } catch (error) {
        logger.error('Error creating teacher:', error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors.map(e => ({
                    field: e.path,
                    message: e.message,
                    value: e.value
                }))
            });
        }
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to create teacher',
            details: error.errors?.map(e => e.message) || []
        });
    }
};

// Update teacher
export const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await Teacher.findByPk(id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                error: 'Teacher not found'
            });
        }

        // Update teacher data
        await teacher.update(req.body);

        res.status(200).json({
            success: true,
            message: 'Teacher updated successfully',
            data: teacher
        });

    } catch (error) {
        logger.error('Error updating teacher:', error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.errors.map(e => ({
                    field: e.path,
                    message: e.message,
                    value: e.value
                }))
            });
        }
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to update teacher',
            details: error.errors?.map(e => e.message) || []
        });
    }
};

// Delete teacher
export const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const teacher = await Teacher.findByPk(id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                error: 'Teacher not found'
            });
        }

        // Delete associated user account
        await User.destroy({ where: { email: teacher.email } });
        
        // Delete teacher
        await teacher.destroy();

        res.status(200).json({
            success: true,
            message: 'Teacher deleted successfully'
        });

    } catch (error) {
        logger.error('Error deleting teacher:', error);
        res.status(400).json({
            success: false,
            error: error.message || 'Failed to delete teacher',
            details: error.errors?.map(e => e.message) || []
        });
    }
}; 