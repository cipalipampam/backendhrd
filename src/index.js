import express from "express";
import {config} from "dotenv";
import corsSetup from 'cors';

import user from './router/data-master/user.js';

config();
const app = express();
app.use(express.json());
app.use(corsSetup());

app.use('/api/user', user);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`App listening on port http://localhost:${PORT}`)
})