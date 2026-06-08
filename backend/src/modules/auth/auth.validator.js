import { body } from 'express-validator';

export const registerValidator = [
    body('email')
        .trim() 
        .isEmail().withMessage('Введіть коректний формат email-адреси'),
    
    body('password')
        .isLength({ min: 8 }).withMessage('Пароль має містити мінімум 8 символів')
        .matches(/[A-Z]/).withMessage('Пароль має містити хоча б одну велику літеру')
        .matches(/[0-9]/).withMessage('Пароль має містити хоча б одну цифру'),
    
    body('firstName')
        .trim()
        .notEmpty().withMessage('Ім\'я є обов\'язковим полем')
        .isLength({ min: 2 }).withMessage('Ім\'я занадто коротке'),

    body('lastName')
        .trim()
        .notEmpty().withMessage('Прізвище є обов\'язковим полем'),

    body('phone')
        .optional() 
        .matches(/^\+?[\d\s\-()]+$/).withMessage('Некоректний формат телефону')
];