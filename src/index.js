import express from "express";
import {config} from "dotenv";
import corsSetup from 'cors';
import jwt from "jsonwebtoken";
import { accessValidation } from "./middleware/access-validation.js";

import user from './router/data-master/user.js';
import auth from './router/auth/auth.js';
import departemen from './router/data-master/departemen.js';
import jabatan from './router/data-master/jabatan.js';
import karyawan from './router/karyawan/karyawan.js';
import pelatihan from './router/pelatihan/pelatihan.js';

config();
const app = express();
app.use(express.json());
app.use(corsSetup());


// auth
app.use('/api/auth', auth);

// data master
app.use('/api/user', accessValidation, user);
app.use('/api/departemen', accessValidation, departemen);
app.use('/api/jabatan', accessValidation, jabatan);

//data karyawan
app.use('/api/karyawan', karyawan);

// pelatihan
app.use('/api/pelatihan', accessValidation, pelatihan);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on port http://localhost:${PORT}`)
})