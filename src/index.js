const express = require('express');
const {Pool} = require('pg');
require('dotenv').config();
require('./tracing.js');

const app = express();
app.use(express.json());

const pool = new Pool({
   host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

//creacione de tabla al iniciar
pool.query(
   `
  CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  )
`
).catch(console.error)

//prometheus
const promClient = require('prom-client');

//recopilar métricas por defecto (CPU, RAM del contender node)
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({register: promClient.register});

//crear histograma personalizado para medir la duración de las peticion HTTP
const httpRequestDurationMicroseconds = new promClient.Histogram({
   name: 'http_request_duration_seconds',
   help: 'Duracion de peticiones HTTP en segundos',
   labelNames: ['method', 'route', 'code'],
   buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] //tiempos de respuesta en segundos
})

//Middleware para medir el tiempo de cada peticion
app.use((req, res, next) => {
   const end = httpRequestDurationMicroseconds.startTimer();
   res.on('finish', () => {
      end({route: req.route ? req.route.path : req.path, code: res.statusCode, method: req.method});
   });
   next();
});

//endpoint que prometheus visitará para metricas
app.get('/metrics', async (req, res) => {
   res.set('Content-Type', promClient.register.contentType);
   res.end(await promClient.register.metrics());
});

//heath check - requerido para docker y balanceadores de carga
app.get('/health', (req, res)=> {
   res.json({status: 'ok', timestamp: new Date().toISOString()});
});

app.get('/tasks', async(req, res)=>{
   try{
      const result = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
      res.json(result.rows);
   } catch (err){
      res.status(500).json({ error: err.messsage});
   }
});

app.post('/tasks', async(req, res)=>{
   const {title} = req.body;
   if(!title) return req.status(400).json({ error: 'El titulo es requerido'});
   try{
      const result = await pool.query(
         'INSERT INTO tasks (title) VALUES ($1) RETURNING *',
         [title]
      );
      res.status(201).json(result.rows[0]);
   } catch (err){
      res.status(500).json({ error: err.message});
   }
});

app.patch('/tasks/:id', async(req, res)=>{
   const {id} = req.params;
   const {completed} = req.body;
   try{
      const result = await pool.query(
         'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *',
      [completed, id]
      );
      if (result.rows.length === 0) return res.status(404).json({error: 'Tarea no encontrada'});
      res.json(result.rows[0]);
   } catch (err){
      res.status(500).json({error: err.message});
   }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Servidor corriendo en puerto ${PORT}`));

/**
 comando crear nueva tarea:
 curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Validación de base de datos"}'

  comando retrieve tareas:
  curl http://localhost:3000/tasks

  comand constuir image postgress docker
  docker run --name postgres-test \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=tasksdb \
  -p 5433:5432 \
  -d postgres:15-alpine

  comando destruir imagen temporal
  docker rm -f postgres-test
 */