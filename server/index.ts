import express from 'express';
import cors from 'cors';
import path from 'path';
import { router as apiRouter } from './routes.ts';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// En producción servir la compilación de Vite
const distPath = path.resolve(process.cwd(), 'dist');
app.use(express.static(distPath));

// Fallback SPA para cualquier ruta no-API
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('API de Amigo Secreto activa en puerto ' + PORT);
    }
  });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🎁 Servidor de Amigo Secreto activo:`);
  console.log(`   👉 En tu computadora: http://localhost:${PORT}`);
  console.log(`   📱 Desde tu celular (misma Wi-Fi): http://192.168.1.10:${PORT}`);
});
