import prisma from '../../prismaClient.js';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { allowRoles } from '../../middleware/role-authorization.js';
import { ROLES } from '../../constants/roles.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// ensure uploads folder exists
const uploadDir = path.resolve(process.cwd(), 'uploads', 'izin');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak diizinkan. Hanya jpg, png, atau pdf.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Employee: submit izin request (with optional file attachment)
router.post(
  '/request',
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: 'Ukuran file maksimal 5MB' });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  [
    body('tanggal').notEmpty().isISO8601(),
    body('jenis').isIn(['IZIN', 'SAKIT']),
    body('keterangan').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // if multer saved file but validation failed, remove file
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: 'Unauthorized' });

      const karyawan = await prisma.karyawan.findUnique({ where: { userId: user.username } });
      if (!karyawan) return res.status(404).json({ message: 'Karyawan not found' });

      const tanggal = new Date(req.body.tanggal);
      tanggal.setHours(0,0,0,0);

      const fileUrl = req.file ? `/uploads/izin/${req.file.filename}` : null;

      const izin = await prisma.izinRequest.create({
        data: {
          karyawanId: karyawan.id,
          tanggal,
          jenis: req.body.jenis,
          keterangan: req.body.keterangan || null,
          fileUrl,
        },
      });

      res.status(201).json({ status: 201, message: 'Izin request created', data: izin });
    } catch (error) {
      console.error('Create izin request error:', error);
      if (req.file) fs.unlinkSync(req.file.path);
      res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
    }
  }
);

// Employee: get my izin requests
router.get('/my-requests', async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const karyawan = await prisma.karyawan.findUnique({ where: { userId: user.username } });
    if (!karyawan) return res.status(404).json({ message: 'Karyawan not found' });

    const requests = await prisma.izinRequest.findMany({
      where: { karyawanId: karyawan.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ status: 200, message: 'My izin requests', data: requests });
  } catch (error) {
    console.error('Get my izin requests error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
  }
});

// HR: list izin requests (filter by status optional)
router.get('/requests', allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const requests = await prisma.izinRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { karyawan: { select: { id: true, nama: true, userId: true } } },
    });

    res.json({ status: 200, message: 'Izin requests', data: requests });
  } catch (error) {
    console.error('List izin requests error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
  }
});

// HR: approve or reject
router.put('/requests/:id/approve', allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { id } = req.params;
    const reqItem = await prisma.izinRequest.findUnique({ where: { id } });
    if (!reqItem) return res.status(404).json({ message: 'Izin request not found' });

    if (reqItem.status !== 'PENDING') return res.status(400).json({ message: 'Request already processed' });

    // create or update kehadiran record for that tanggal
    const tanggal = new Date(reqItem.tanggal);
    tanggal.setHours(0,0,0,0);

    // upsert kehadiran
    const kehadiran = await prisma.kehadiran.upsert({
      where: { karyawanId_tanggal: { karyawanId: reqItem.karyawanId, tanggal } },
      update: {
        status: reqItem.jenis === 'SAKIT' ? 'SAKIT' : 'IZIN',
        keterangan: reqItem.keterangan || null,
        // do not overwrite waktuMasuk/waktuKeluar
      },
      create: {
        karyawanId: reqItem.karyawanId,
        tanggal,
        status: reqItem.jenis === 'SAKIT' ? 'SAKIT' : 'IZIN',
        keterangan: reqItem.keterangan || null,
      },
    });

    const updatedReq = await prisma.izinRequest.update({
      where: { id },
      data: { status: 'APPROVED', approvedBy: req.user?.username || null, approvedAt: new Date() },
    });

    res.json({ status: 200, message: 'Request approved', data: { izin: updatedReq, kehadiran } });
  } catch (error) {
    console.error('Approve izin request error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
  }
});

router.put('/requests/:id/reject', allowRoles(ROLES.HR), async (req, res) => {
  try {
    const { id } = req.params;
    const reqItem = await prisma.izinRequest.findUnique({ where: { id } });
    if (!reqItem) return res.status(404).json({ message: 'Izin request not found' });

    if (reqItem.status !== 'PENDING') return res.status(400).json({ message: 'Request already processed' });

    const updatedReq = await prisma.izinRequest.update({
      where: { id },
      data: { status: 'REJECTED', approvedBy: req.user?.username || null, approvedAt: new Date() },
    });

    res.json({ status: 200, message: 'Request rejected', data: updatedReq });
  } catch (error) {
    console.error('Reject izin request error:', error);
    res.status(500).json({ status: 500, message: 'Internal server error', error: error.message });
  }
});

export default router;
