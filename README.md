# KnowledgeHub AI - Plataforma Multimodal RAG

Plataforma de Retrieval-Augmented Generation (RAG) multimodal.

## Arquitectura del Proyecto

El proyecto está organizado en los siguientes módulos:

- **backend/** — API construida con FastAPI (`backend/app`), responsable de la lógica de negocio y los endpoints de la plataforma.
- **frontend/** — Aplicación cliente que consumirá la API del backend.
- **docker/** — Archivos y configuraciones de contenedores para despliegue.
- **docker-compose.yaml** — Orquestación de los servicios del proyecto (backend, frontend, dependencias).
- **datasets/** — Conjuntos de datos utilizados para la plataforma multimodal RAG.
- **docs/** — Documentación técnica y funcional del proyecto.
- **pyproject.toml** / **uv.lock** — Gestión de dependencias del backend mediante `uv`.
