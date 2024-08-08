import express from 'express';
import { userRouter } from './routes/user.route';
import { errorHandler } from './middlewares/error-handler';

const app = express();
app.use(express.json());

app.use('/api/users', userRouter);

// Middleware مدیریت خطا
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
