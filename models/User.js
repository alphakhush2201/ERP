import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['ADMIN', 'TEACHER', 'STUDENT']]
        }
    },
    mustChangePassword: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lastLogin: {
        type: DataTypes.DATE
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'active',
        validate: {
            isIn: [['active', 'inactive', 'suspended']]
        }
    }
}, {
    timestamps: true,
    tableName: 'users'
});

export { User }; 