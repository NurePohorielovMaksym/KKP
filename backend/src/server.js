import express from 'express';
import pool from './config/db.js'; 
import userRoutes from './modules/users/user.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import specialistRoutes from './modules/specialists/specialist.routes.js';
import timeSlotsRoutes from './modules/time-slots/time-slot.routes.js';
import rehabRoutes from './modules/rehabilitation-type/rehabilitation-type.routes.js';
import appointmentRoutes from './modules/appointments/appointment.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import emailAppointmentRouter from './modules/email-appointment/email-appointment.routes.js';
import reviewRoutes from './modules/review/review.routes.js'
import './cron/appointmentCron.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/api/test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            message: "Бекенд працює на ES Modules (через import)!",
            dbTime: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({ error: "Помилка бази даних", details: error.message });
    }
});

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Kinetra API',
            version: '1.0.0',
            description: 'Документація API для реабілітаційного центру',
        },
        components: {
    securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Вставте ваш JWT токен сюди'
            }
        }
        },
        servers: [
            {
                url: 'http://localhost:5000',
            },
        ],
    },
    apis: ['./src/modules/**/*.js'], 
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/specialists', specialistRoutes);
app.use('/api/time-slots', timeSlotsRoutes);
app.use('/api/rehabilitation-types', rehabRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/appointment', emailAppointmentRouter);
app.use('/api/reviews', reviewRoutes);

app.listen(PORT, () => {
    console.log(`\n--- СЕРВЕР ЗАПУЩЕНО ---`);
    console.log(`🚀 Адреса: http://localhost:${PORT}`);
    console.log(`🔍 Тест: http://localhost:${PORT}/api/test\n`);
});