import { validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Помилка валідації даних",
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    
    next();
};