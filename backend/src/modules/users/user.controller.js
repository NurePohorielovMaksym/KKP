import UserService from "./user.service.js";

class UserController{

    async getUsers(req, res){

        try{
            const users = await UserService.getAllUsers();

            res.status(200).json({
                success: true,
                count: users.length,
                data: users
            });
        } catch (error) {
            
            console.error("Помилка в getUsers:", error);
            res.status(500).json({
                success: false,
                message: "Внутрішня помилка сервера"
            });
        }
    }

    async getUser(req, res) {
        try {
            const userId = req.params.id; 
            
            const user = await UserService.getUserById(userId);
            
            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {

            res.status(404).json({
                success: false,
                message: error.message 
            });
        }
    }

    async update(req, res) {
    try {
      const { id } = req.params;
      
      if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
        return res.status(403).json({ success: false, message: "Ви не можете оновлювати чужий профіль" });
      }

      const updatedUser = await UserService.updateUserProfile(id, req.body);
      
      res.status(200).json({ 
        success: true, 
        message: "Дані користувача успішно оновлено", 
        data: updatedUser 
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deletedUser = await UserService.deleteUser(id);
      
      res.status(200).json({ 
        success: true, 
        message: "Користувача та всі його профілі успішно видалено",
        data: deletedUser
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

}

export default new UserController();