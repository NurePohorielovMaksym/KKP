import AdminService from './admin.service.js';
import pool from '../../config/db.js';

class AdminController {

  async getDashboard(req, res) {
    try {
      const data = await AdminService.getDashboard();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAppointments(req, res) {
    try {
      const data = await AdminService.getAppointments(req.query);
      res.json({ success: true, ...data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateAppointmentStatus(req, res) {
    try {
      const data = await AdminService.updateAppointmentStatus(req.params.id, req.body.status);
      res.json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteAppointment(req, res) {
    try {
      const data = await AdminService.deleteAppointment(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const data = await AdminService.getUsers(req.query);
      res.json({ success: true, ...data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      const data = await AdminService.getUserById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateUserRole(req, res) {
    const { id } = req.params;
    const { role } = req.body;

    const allowed = ['patient', 'doctor', 'admin'];
    if (!allowed.includes(role)) {
      return res.status(400).json({ success: false, message: 'Недопустима роль' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const userCheck = await client.query('SELECT id FROM users WHERE id = $1', [id]);
      if (userCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Користувача не знайдено' });
      }

      await client.query(
        'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2',
        [role, id]
      );

      if (role === 'doctor') {
        const specCheck = await client.query(
          'SELECT id FROM specialists WHERE user_id = $1', [id]
        );
        if (specCheck.rows.length === 0) {
          await client.query(
            'INSERT INTO specialists (user_id, is_active) VALUES ($1, true)', [id]
          );
        } else {
          await client.query(
            'UPDATE specialists SET is_active = true WHERE user_id = $1', [id]
          );
        }
      } else {
        await client.query(
          'UPDATE specialists SET is_active = false WHERE user_id = $1', [id]
        );
      }

      await client.query('COMMIT');

      const result = await pool.query(
        'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1', [id]
      );
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      await client.query('ROLLBACK');
      res.status(500).json({ success: false, message: 'Помилка при зміні ролі' });
    } finally {
      client.release();
    }
  }

  async deleteUser(req, res) {
    try {
      const data = await AdminService.deleteUser(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getSpecialists(req, res) {
    try {
      const data = await AdminService.getSpecialists();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async toggleSpecialist(req, res) {
    try {
      const data = await AdminService.toggleSpecialist(req.params.id, req.body.is_active);
      res.json({ success: true, data });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

export default new AdminController();