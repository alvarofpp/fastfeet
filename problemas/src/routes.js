import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import authMiddleware from './app/middlewares/auth';
import FileController from './app/controllers/FileController';
import ProblemController from './app/controllers/ProblemController';

const routes = new Router();

const upload = multer(multerConfig);

routes.post('/files', upload.single('file'), FileController.store);

routes.use(authMiddleware);

routes.get('/problems', ProblemController.index);
routes.post('/problems', ProblemController.store);

export default routes;
