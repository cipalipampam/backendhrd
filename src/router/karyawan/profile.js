import prisma from '../../prismaClient.js';
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// ensure uploads folder exists
const uploadDir = path.resolve(process.cwd(), 'uploads', 'profile');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `profile-${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png) are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload profile photo
router.post('/photo', upload.single('photo'), async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No photo file uploaded'
      });
    }

    // Get current user to delete old photo if exists
    const currentUser = await prisma.user.findUnique({
      where: { username: user.username },
      select: { foto_profil: true }
    });

    // Delete old photo file if exists
    if (currentUser?.foto_profil) {
      const oldPhotoPath = path.resolve(process.cwd(), currentUser.foto_profil.replace('/uploads/', 'uploads/'));
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Update user with new photo path
    const photoUrl = `/uploads/profile/${req.file.filename}`;
    const updatedUser = await prisma.user.update({
      where: { username: user.username },
      data: { foto_profil: photoUrl },
      select: {
        username: true,
        email: true,
        nama_lengkap: true,
        foto_profil: true,
        role: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile photo updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    
    // Delete uploaded file if database update fails
    if (req.file) {
      const filePath = path.resolve(uploadDir, req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload profile photo',
      error: error.message
    });
  }
});

// Delete profile photo
router.delete('/photo', async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const currentUser = await prisma.user.findUnique({
      where: { username: user.username },
      select: { foto_profil: true }
    });

    if (!currentUser?.foto_profil) {
      return res.status(404).json({
        success: false,
        message: 'No profile photo to delete'
      });
    }

    // Delete photo file
    const photoPath = path.resolve(process.cwd(), currentUser.foto_profil.replace('/uploads/', 'uploads/'));
    if (fs.existsSync(photoPath)) {
      fs.unlinkSync(photoPath);
    }

    // Update user to remove photo
    const updatedUser = await prisma.user.update({
      where: { username: user.username },
      data: { foto_profil: null },
      select: {
        username: true,
        email: true,
        nama_lengkap: true,
        foto_profil: true,
        role: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile photo deleted successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete profile photo',
      error: error.message
    });
  }
});

export default router;
