# Node.js API - Observability Stack

Este proyecto implementa una capa completa de observabilidad (Métricas, Logs y Trazas) sobre una API RESTful en Node.js y PostgreSQL, utilizando un stack 100% open source y optimizado para entornos locales.

## Arquitectura de Observabilidad

- **Aplicación:** Node.js (Express) auto-instrumentado con OpenTelemetry y `prom-client`.
- **Métricas:** **Prometheus** extrayendo datos mediante modelo Pull.
- **Logs:** **Grafana Loki** centralizando registros mediante **Promtail** (leyendo directamente del socket de Docker).
- **Trazas Distribuidas:** **Grafana Tempo** recibiendo trazas OTLP para identificar latencia entre Express y PostgreSQL.
- **Visualización:** **Grafana OSS** unificando las tres señales en una sola interfaz.
- **Alertas:** **Alertmanager** gestionando reglas de indisponibilidad evaluadas por Prometheus.

## 🚀Despliegue Local

El stack está orquestado con Docker Compose. Diseñado para consumir pocos recursos, evitando componentes pesados basados en JVM.

```bash
# Iniciar toda la infraestructura
docker compose up -d --build
```
