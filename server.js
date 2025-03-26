import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import commissionerRoutes from './routes/commissionerRoutes.js';
import electionRoutes from "./routes/election.routes.js" 
import session from 'express-session';
import passport from 'passport';
import './config/passport.js';

import db from './config/db.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Allow your frontend origin
  credentials: true, // Allow credentials (cookies, auth headers)
}));
app.use(express.json());

app.use(session({ secret: 'your_secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/commissioner', commissionerRoutes);
app.use("/api/elections", electionRoutes) 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

console.log("wl");