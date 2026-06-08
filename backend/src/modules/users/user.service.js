import UserRepository from './user.repository.js';

class UserService{

    async getAllUsers() {
        const users = await UserRepository.findUsers();
        return users;
    }

    async getUserById(id) {
        if (!id){
            throw new Error("ID користувача є обов'язковим для пошуку");
        }

        const user = await UserRepository.findUserById(id);

        if (!user) {
            throw new Error("ID користувача є обов'язковим для пошуку");
        }

        return user;
    } 

    async updateUserProfile(id, updateData) {

    const updatedUser = await UserRepository.update(id, updateData);
    
    if (!updatedUser) {
      throw new Error('Не вдалося оновити користувача');
    }
    
    return updatedUser;
  }

  async deleteUser(id) {
    const deletedUser = await UserRepository.delete(id);
    if (!deletedUser) {
      throw new Error('Користувача не знайдено');
    }
    return deletedUser;
  }

}

export default new UserService();