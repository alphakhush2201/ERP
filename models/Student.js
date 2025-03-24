import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Student = sequelize.define('Student', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: false
    },
    street: {
        type: DataTypes.STRING
    },
    city: {
        type: DataTypes.STRING
    },
    state: {
        type: DataTypes.STRING
    },
    zipCode: {
        type: DataTypes.STRING
    },
    country: {
        type: DataTypes.STRING
    },
    enrollmentDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    grade: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parentName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parentPhone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parentEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'graduated'),
        defaultValue: 'active'
    }
}, {
    timestamps: true,
    tableName: 'students'
});

export default Student; 