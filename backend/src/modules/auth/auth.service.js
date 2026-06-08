import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import AuthRepository from './auth.repository.js';
import { sendResetCode } from '../../services/email.service.js';

class AuthService {
  async register(userData) {
    const { email, password, firstName, lastName, middleName, phone } = userData;
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await AuthRepository.getUserByEmail(normalizedEmail);
    if (existingUser) throw new Error('Користувач з таким email вже існує');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    return await AuthRepository.createUser(normalizedEmail, passwordHash, firstName, lastName, middleName, phone);
  }

  async registerStaff(userData) {
    const { email, password, firstName, lastName, middleName, phone, role, specialization, qualification, yearsOfExperience } = userData;
    if (!['doctor', 'admin'].includes(role)) throw new Error('Неприпустима роль');
    const existingUser = await AuthRepository.getUserByEmail(email);
    if (existingUser) throw new Error('Користувач з таким email вже існує');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    return await AuthRepository.createStaffUser({ email, passwordHash, firstName, lastName, middleName, phone, role, specialization, qualification, yearsOfExperience });
  }

  async login(email, password) {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await AuthRepository.getUserByEmail(normalizedEmail);
    if (!user) throw new Error('Невірний email або пароль');
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) throw new Error('Невірний email або пароль');

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // ✅ Для лікаря підтягуємо specialist_id
    let specialistId = null;
    if (user.role === 'doctor') {
      const specialist = await AuthRepository.getSpecialistByUserId(user.id);
      specialistId = specialist?.specialist_id ?? null;
    }

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        ...(specialistId !== null && { specialist_id: specialistId }),
      },
    };
  }

  async forgotPassword(identifier) {
    const user = await AuthRepository.getUserByIdentifier(identifier);
    if (!user) throw new Error('Користувача не знайдено');
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = new Date(Date.now() + 10 * 60000);
    await AuthRepository.setResetCode(user.id, code, expires);
    const isEmail = identifier.includes('@');
    if (isEmail) {
      await sendResetCode(identifier, code);
    } else {
      console.log(`[SMS] Код для ${identifier}: ${code}`);
    }
    return { type: isEmail ? 'email' : 'phone' };
  }

  async verifyOtp(code) {
    const user = await AuthRepository.getUserByResetCode(code);
    if (!user) throw new Error('Невірний код');
    if (new Date() > new Date(user.reset_password_expires)) throw new Error('Код протермінований');
    return true;
  }

  async resetPassword(code, newPassword) {
    const user = await AuthRepository.getUserByResetCode(code);
    if (!user) throw new Error('Невірний або протермінований код');
    if (new Date() > new Date(user.reset_password_expires)) throw new Error('Код протермінований');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await AuthRepository.updatePassword(user.id, hashedPassword);
  }
}

export default new AuthService();