import express from "express";
import {config} from "dotenv";
import corsSetup from 'cors';
import { accessValidation } from "./middleware/access-validation.js";
import { allowRoles } from "./middleware/role-authorization.js";
import { ROLES } from "./constants/roles.js";

import user from './router/data-master/user.js';
import auth from './router/auth/auth.js';
import departemen from './router/data-master/departemen.js';
import jabatan from './router/data-master/jabatan.js';
import karyawan from './router/karyawan/karyawan.js';
import kpi from './router/karyawan/kpi.js';
import kpiBulanan from './router/karyawan/kpi-bulanan.js';
import kpiKaryawan from './router/karyawan/kpi-karyawan.js';
import penghargaan from './router/karyawan/penghargaan.js';
import kehadiran from './router/karyawan/kehadiran.js';
import izinRouter from './router/karyawan/izin.js';
import pelatihan from './router/pelatihan/pelatihan.js';
import xgboostModel from './router/promotion-ai/xgboost-model.js';
import promotion from './router/promotion-ai/promotion.js';
import { runPrismaMigrateAndSeed } from './bootstrap.js';
import karyawanFeatures from './router/karyawan/karyawan-features.js';
import predict from './router/promotion-ai/predict.js';

config();
runPrismaMigrateAndSeed();
const app = express();
app.use(express.json());
app.use(corsSetup());


// auth
app.use('/api/auth', auth);

// data master (HR only)
app.use('/api/user', accessValidation, user);
app.use('/api/departemen', accessValidation, departemen);
app.use('/api/jabatan', accessValidation, jabatan);

//data karyawan - HR can see all, karyawan can only see their own
// PINDAHKAN route yang lebih spesifik ke atas
app.use('/api/karyawan/kpi-bulanan', accessValidation, kpiKaryawan);
app.use('/api/karyawan-features', accessValidation, karyawanFeatures);
app.use('/api/karyawan', accessValidation, karyawan);
app.use('/api/kpi', accessValidation, kpi);
app.use('/api/kpi/bulanan', accessValidation, kpiBulanan);
app.use('/api/penghargaan', accessValidation, penghargaan);
app.use('/api/kehadiran', accessValidation, kehadiran);
app.use('/api/kehadiran', accessValidation, izinRouter);

// serve uploaded files (izin attachments)
import path from 'path';
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

// pelatihan - HR can manage all, karyawan can see their own
app.use('/api/pelatihan', accessValidation, pelatihan);

// XGBoost model support (HR only)
app.use('/api/xgboost', accessValidation, xgboostModel);
app.use('/api/promotion', accessValidation, promotion);

app.use('/api/predict', accessValidation, predict);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on port http://localhost:${PORT}`)
})