import SpecialistService from './specialist.service.js';
import fs from 'fs';
import {UploadToImageKit} from "../../config/UploadToImageKit.js";

class SpecialistController {
  async getAll(req, res) {
    try {
      const specialists = await SpecialistService.getAllSpecialists();
      res.status(200).json({ success: true, data: specialists });
    } catch (error) {
      res.status(500).json({ success: false, message: "Помилка сервера при отриманні спеціалістів" });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const specialist = await SpecialistService.getSpecialistById(id);
      res.status(200).json({ success: true, data: specialist });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      if (req.file) {
        const uploadedUrl = await UploadToImageKit(req.file);
        
        updateData.photo_url = uploadedUrl;

        fs.unlinkSync(req.file.path);
      }

      const updatedProfile = await SpecialistService.updateSpecialistProfile(id, updateData);

      res.json({
        success: true,
        message: 'Профіль успішно оновлено',
        data: updatedProfile
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ success: false, message: error.message });
    }
  }

async getSpecializations(req, res) {
  try {
    const list = await SpecialistService.getSpecializationsList();
    res.json({
      success: true,
      data: list
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

}

export default new SpecialistController();