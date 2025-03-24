import { User } from './User.js';
import { Teacher } from './Teacher.js';

// User-Teacher relationship
User.hasOne(Teacher, {
    foreignKey: 'userId',
    as: 'teacher'
});

Teacher.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});

export { User, Teacher }; 