# fase 1 instala dependencias
FROM node:20-alpine AS builder

WORKDIR /app
 
#copiar archivos del package primero (caché)
#si cambio el codigo en src y nada en el package, docker omite npm ci y solo reconstruye
COPY package*.json ./
RUN npm ci

COPY . .

#fase 2 imagen de produccion
FROM node:20-alpine AS production

#creacion de usuario no root (correr un ususario root dentro de un container es un riesgo de seguridad)
RUN addgroup -g 1001 -S nodejs && \
   adduser -S nodeuser -u 1001

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

#copiar solo el codigo fuente de la fase de construccion (no los node_modules o archivos dev)
COPY --from=builder /app/src ./src

RUN chown -R nodeuser:nodejs /app
USER nodeuser

EXPOSE 300

#docker hara ping a la api /health cada 30s. Si falla 3 veces, el conteneder se marcará como unhealthy
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
   CMD wget --noverbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]