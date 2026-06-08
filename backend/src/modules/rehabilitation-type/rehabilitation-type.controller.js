import RehabilitationTypeService from './rehabilitation-type.service.js';
import fs from 'fs';
import {UploadToImageKit} from "../../config/UploadToImageKit.js";

class RehabilitationTypeController {
  async getAll(req, res) {
    try {
      const types = await RehabilitationTypeService.getAllTypes();
      res.json({
        success: true,
        data: types
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const newData = { ...req.body };
 
      if (req.file) {
        const uploadedUrl = await UploadToImageKit(req.file);
        newData.photo_url_rehab = uploadedUrl;
        fs.unlinkSync(req.file.path);
      }
 
      const newType = await RehabilitationTypeService.createType(newData);
      res.status(201).json({
        success: true,
        message: 'Тип реабілітації успішно створено',
        data: newType
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ success: false, message: error.message });
    }
  }
 
  async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
 
      if (req.file) {
        const uploadedUrl = await UploadToImageKit(req.file);
        updateData.photo_url_rehab = uploadedUrl;
        fs.unlinkSync(req.file.path);
      }
 
      const updatedType = await RehabilitationTypeService.updateType(id, updateData);
      res.json({
        success: true,
        message: 'Тип реабілітації оновлено',
        data: updatedType
      });
    } catch (error) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
  try {
    const { id } = req.params;
    const result = await RehabilitationTypeService.deleteType(id);
    
    res.json({
      success: true,
      message: `Тип реабілітації "${result.name}" видалено`,
      data: result
    });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
}

async getBySpecialization(req, res) {
  try {
    const types = await RehabilitationTypeService.getBySpecialization(req.params.specialization);
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async getByCategory(req, res) {
  try {
    const { categoryName } = req.params; 
    const types = await RehabilitationTypeService.getTypesByCategory(categoryName);
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async getById(req, res) {
    try {
      const { id } = req.params;
      const type = await RehabilitationTypeService.getTypeById(id);
      
      if (!type) {
        return res.status(404).json({ success: false, message: 'Тип реабілітації не знайдено' });
      }
      
      res.json({
        success: true,
        data: type
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

}

export default new RehabilitationTypeController();