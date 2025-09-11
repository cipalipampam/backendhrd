import express from "express";
import {config} from "dotenv";
import corsSetup from 'cors';

import user from './router/data-master/user.js';
import divisi from './router/data-master/divisi.js';
import jabatan from './router/data-master/jabatan.js';

import pelatihan from './router/pelatihan/pelatihan.js';

config();
const app = express();
app.use(express.json());
app.use(corsSetup());

// data master
app.use('/api/user', user);
app.use('/api/divisi', divisi);
app.use('/api/jabatan', jabatan);

// pelatihan
app.use('/api/pelatihan', pelatihan);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on port http://localhost:${PORT}`)
})