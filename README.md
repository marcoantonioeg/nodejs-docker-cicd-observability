# Task Management API - DevOps CI/CD Pipeline

Este proyecto es una API RESTful para la gestión de tareas, empaquetada y orquestada mediante Docker, con un pipeline de Integración y Entrega Continua (CI/CD) completamente automatizado a través de GitHub Actions.

El objetivo principal es demostrar prácticas de contenedorización, despliegue local de entornos multi-servicio y automatización de procesos DevOps.

## Arquitectura y Tecnologías

- **Backend:** Node.js 20 (Active LTS) y Express.js.
- **Base de Datos:** PostgreSQL 15.
- **Contenedorización:** Docker (Dockerfile multi-stage para optimización de tamaño y seguridad).
- **Orquestación Local:** Docker Compose (Redes internas, dependencias de inicio y volúmenes persistentes).
- **CI/CD:** GitHub Actions (Construcción automática y publicación).
- **Registro de Contenedores:** Docker Hub.

## Características DevOps Implementadas

- **Construcción Multi-stage:** Reduce el peso de la imagen de producción eliminando dependencias de desarrollo y utiliza un usuario no-root por seguridad.
- **Health Checks:** Configurados tanto en el contenedor de Node.js como en PostgreSQL para garantizar que el tráfico solo fluya cuando los servicios están listos.
- **Caché en CI/CD:** Implementación de caché de capas en GitHub Actions (`type=gha`) para acelerar los tiempos de construcción en subsecuentes ejecuciones.
- **Versionado Dinámico:** Generación automática de etiquetas `latest` y `sha-*` para control de versiones y rollback inmediato.

## Ejecución Local

### Prerrequisitos

- [Docker Desktop](https://docs.docker.com/get-docker/) instalado.
- Git.

### Instalación y Despliegue

1. Clona este repositorio:
   ```bash
   git clone [https://github.com/marcoantonioeg/nodejs-docker-cicd.git)
   cd nodejs-docker-cicd
   ```
