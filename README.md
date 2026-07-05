# 🚀 KnowledgeHub AI

> Enterprise Multimodal RAG Platform powered by NVIDIA

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12-blue.svg)
![Status](https://img.shields.io/badge/status-en%20desarrollo-yellow.svg)

KnowledgeHub AI es una plataforma que permite a cualquier organización crear asistentes inteligentes privados utilizando sus propios documentos.

Cada usuario puede crear espacios de trabajo (Workspaces), cargar documentación en diferentes formatos (PDF, Word, Excel, imágenes y más) y consultar esa información mediante un chat conversacional impulsado por Inteligencia Artificial.

La plataforma utiliza Retrieval-Augmented Generation (RAG), embeddings multimodales y una base de datos vectorial para proporcionar respuestas precisas, explicables y fundamentadas en las fuentes originales.

## 📑 Contenido

- [Problemática](#-problemática)
- [Solución](#-solución)
- [Objetivo](#-objetivo)
- [Caso de Uso Inicial](#-caso-de-uso-inicial)
- [Características](#-características)
- [Tecnologías](#️-tecnologías)
- [Librerías](#-librerías)
- [Arquitectura](#-arquitectura)
- [Roadmap](#-roadmap)
- [Licencia](#-licencia)

---

# 📌 Problemática

Actualmente, las organizaciones almacenan información crítica en múltiples formatos como documentos PDF, archivos Word, hojas de cálculo, imágenes, manuales, políticas internas y documentación técnica.

Con el paso del tiempo, esta información se vuelve difícil de localizar, generando problemas como:

- Pérdida de tiempo buscando información.
- Dependencia del conocimiento de personas específicas.
- Información duplicada.
- Respuestas inconsistentes.
- Dificultad para consultar diagramas, imágenes y documentación técnica.
- Buscadores tradicionales que solo encuentran palabras clave y no comprenden el contexto.

Como consecuencia, empleados, analistas y equipos técnicos invierten una gran cantidad de tiempo buscando información que ya existe dentro de la organización.

---

# 💡 Solución

KnowledgeHub AI centraliza el conocimiento de una organización permitiendo crear asistentes inteligentes privados basados únicamente en la documentación proporcionada por cada usuario.

La plataforma es capaz de:

- Crear múltiples Workspaces independientes.
- Subir documentos de diferentes formatos.
- Indexar automáticamente la información.
- Generar embeddings para texto e imágenes.
- Almacenar el conocimiento en una base de datos vectorial.
- Recuperar únicamente la información relevante.
- Responder mediante un chat conversacional.
- Mostrar las fuentes utilizadas en cada respuesta.

---

# 🎯 Objetivo

Desarrollar una plataforma SaaS de asistentes inteligentes basada en RAG multimodal que permita a cualquier organización construir espacios privados de conocimiento utilizando sus propios documentos.

---

# 🏢 Caso de Uso Inicial

La primera demostración del proyecto estará enfocada en el área de Recursos Humanos.

Los usuarios podrán consultar información como:

- ¿Cuántos días de vacaciones tengo?
- ¿Cómo solicito una incapacidad?
- ¿Cuál es el proceso de contratación?
- ¿Qué beneficios ofrece la empresa?
- ¿Cuál es el reglamento interno?
- ¿Quién aprueba una licencia?

Todas las respuestas estarán fundamentadas en los documentos cargados por la empresa.

---

# 🚀 Características

- Autenticación de usuarios.
- Gestión de Workspaces.
- Carga de documentos.
- Chat conversacional.
- RAG Multimodal.
- Embeddings de texto e imágenes.
- Base de datos vectorial.
- Historial de conversaciones.
- Citas y referencias de documentos.
- Arquitectura escalable.
- Integración con NVIDIA AI.

---

# 🛠️ Tecnologías

| Área                  | Tecnologías                          |
| --------------------- | ------------------------------------ |
| Backend               | Python 3.12, FastAPI, SQLAlchemy, Alembic |
| Inteligencia Artificial | NVIDIA AI, Embeddings, RAG, LLM, LlamaIndex |
| Base de Datos         | PostgreSQL, Qdrant                   |
| Frontend              | Flutter                              |
| DevOps                | Docker, Docker Compose, UV (Astral)  |

---

# 📦 Librerías

Dependencias del backend (gestionadas con `uv`) y para qué se usa cada una:

| Librería | Uso |
| --- | --- |
| `fastapi` | Framework web para construir la API REST de la plataforma. |
| `uvicorn[standard]` | Servidor ASGI que ejecuta la aplicación FastAPI. |
| `sqlalchemy` | ORM para modelar y consultar la base de datos relacional (usuarios, workspaces, documentos, chats). |
| `alembic` | Migraciones versionadas del esquema de base de datos. |
| `psycopg[binary]` | Driver de conexión a PostgreSQL. |
| `python-jose[cryptography]` | Creación y verificación de JWT para la autenticación. |
| `passlib[bcrypt]` | Hashing seguro de contraseñas de usuario. |
| `python-multipart` | Soporte para carga de archivos (`multipart/form-data`) en los endpoints. |
| `pydantic-settings` | Configuración y variables de entorno tipadas y validadas. |
| `qdrant-client` | Cliente para Qdrant, la base de datos vectorial usada en el RAG. |
| `langchain` | Orquestación del pipeline RAG (chunking, retrieval, prompts). |
| `langchain-community` | Integraciones de terceros para LangChain (loaders, vector stores, etc.). |
| `langchain-text-splitters` | División de documentos en chunks antes de generar embeddings. |
| `pymupdf` | Extracción de texto e imágenes de archivos PDF. |
| `python-docx` | Lectura y extracción de contenido de archivos Word (`.docx`). |
| `pillow` | Procesamiento de imágenes para el pipeline RAG multimodal. |

---

# 📂 Arquitectura

El proyecto está organizado como un monorepo, separando claramente el backend, el frontend y la infraestructura de despliegue:

```
KnowledgeHub-AI-Plataforma-Multimodal-RAG/
├── backend/            # API construida con FastAPI
│   └── app/            # Lógica de negocio y endpoints
├── frontend/           # Aplicación cliente (Flutter)
├── docker/             # Configuraciones de contenedores
├── docker-compose.yml  # Orquestación de servicios
├── datasets/           # Conjuntos de datos para el RAG multimodal
├── docs/               # Documentación técnica y funcional
├── pyproject.toml      # Dependencias del backend (gestionadas con uv)
└── uv.lock
```

- **backend/** — API construida con FastAPI (`backend/app`), responsable de la lógica de negocio y los endpoints de la plataforma.
- **frontend/** — Aplicación cliente que consumirá la API del backend.
- **docker/** — Archivos y configuraciones de contenedores para despliegue.
- **docker-compose.yml** — Orquestación de los servicios del proyecto (backend, frontend, dependencias).
- **datasets/** — Conjuntos de datos utilizados para la plataforma multimodal RAG.
- **docs/** — Documentación técnica y funcional del proyecto.
- **pyproject.toml** / **uv.lock** — Gestión de dependencias del backend mediante `uv`.

---

# 📅 Roadmap

- [x] Diseño de la arquitectura
- [ ] Backend
- [ ] Base de datos
- [ ] Autenticación
- [ ] Gestión de Workspaces
- [ ] Ingesta de documentos
- [ ] Embeddings
- [ ] Base vectorial
- [ ] Chat IA
- [ ] Frontend
- [ ] Docker
- [ ] Despliegue

---

# 📄 Licencia

MIT License
