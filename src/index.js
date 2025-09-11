import express from "express";
import {config} from "dotenv";
import corsSetup from 'cors';

import user from './router/data-master/user.js';
import divisi from './router/data-master/divisi.js';
import jabatan from './router/data-master/jabatan.js';

config();
const app = express();
app.use(express.json());
app.use(corsSetup());

app.use('/api/user', user);
app.use('/api/divisi', divisi);
app.use('/api/jabatan', jabatan);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on port http://localhost:${PORT}`)
})