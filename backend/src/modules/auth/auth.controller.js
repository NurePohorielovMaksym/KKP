import AuthService from './auth.service.js';

class AuthController {
  async register(req, res) {
    try {
      const newUser = await AuthService.register(req.body);
      res.status(201).json(newUser);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async registerStaff(req, res) {
    try {
      const newUser = await AuthService.registerStaff(req.body);
      res.status(201).json({ message: "Співробітника успішно створено", user: newUser });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.json(result);
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  }

  async logout(req, res) {
    try {
      res.status(200).json({ 
        success: true, 
        message: "Ви успішно вийшли з системи" 
      });
    } catch (err) {
      res.status(500).json({ message: "Помилка при виході з системи" });
    }
  }

  async forgotPassword(req, res) {
    try {
      const { identifier } = req.body; 
      if (!identifier) throw new Error('Вкажіть Email або номер телефону');

      const result = await AuthService.forgotPassword(identifier);
      
      res.json({ 
        success: true, 
        message: `Код підтвердження відправлено на ваш ${result.type === 'email' ? 'Email' : 'телефон'}` 
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
  
  async verifyOtp(req, res) {
  try {
    const { token } = req.body;
    if (!token) throw new Error('Введіть код');
    await AuthService.verifyOtp(token);
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      await AuthService.resetPassword(token, newPassword);
      res.json({ success: true, message: 'Пароль успішно змінено' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

}

export default new AuthController();