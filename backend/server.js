import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import commissionerRoutes from './routes/commissionerRoutes.js';
import electionRoutes from "./routes/election.routes.js"; 
import voteRoutes from "./routes/voteRoutes.js"
import reminderRoutes from "./routes/reminderRoutes.js"

import { preventBannedUser } from './middleware/authMiddleware.js'; // Import preventBannedUser
import session from 'express-session';
import passport from 'passport';
import './config/passport.js';

import cookieParser from 'cookie-parser';

import swaggerUi from "swagger-ui-express"
import swaggerSpec from "./swagger.js"

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

app.use(preventBannedUser); // Apply middleware globally

app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/commissioner', commissionerRoutes);
app.use("/api/elections", electionRoutes); 
app.use("/api/vote", voteRoutes);
app.use("/api/remind", reminderRoutes)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`)
})
console.log("wl");
