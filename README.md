# 🚀 KnowledgeHub AI

> Enterprise Multimodal RAG Platform powered by OpenAI

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
- Integración con OpenAI (chat y embeddings).

---

# 🛠️ Tecnologías

| Área                  | Tecnologías                          |
| --------------------- | ------------------------------------ |
| Backend               | Python 3.12, FastAPI, SQLAlchemy, Alembic |
| Inteligencia Artificial | OpenAI (`gpt-4o-mini`, `text-embedding-3-small`), Qdrant, RAG |
| Base de Datos         | PostgreSQL, Qdrant                   |
| Frontend              | React 19, Vite, TypeScript, TailwindCSS |
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
| `passlib[bcrypt]` / `bcrypt` | Hashing seguro de contraseñas de usuario. |
| `email-validator` | Validación de direcciones de correo en los schemas de registro/login. |
| `python-multipart` | Soporte para carga de archivos (`multipart/form-data`) en los endpoints. |
| `pydantic-settings` | Configuración y variables de entorno tipadas y validadas. |
| `qdrant-client` | Cliente para Qdrant, la base de datos vectorial usada en el RAG. |
| `openai` | Cliente para generar embeddings y respuestas de chat con la API de OpenAI. |
| `pymupdf` | Extracción de texto de archivos PDF. |
| `python-docx` | Lectura y extracción de contenido de archivos Word (`.docx`). |
| `openpyxl` | Lectura y extracción de contenido de hojas de cálculo Excel (`.xlsx`). |

---

# 📂 Arquitectura

El proyecto está organizado como un monorepo, separando claramente el backend y el frontend, orquestados con Docker Compose:

```
KnowledgeHub-AI-Plataforma-Multimodal-RAG/
├── backend/                # API construida con FastAPI
│   ├── app/
│   │   ├── api/v1/         # Endpoints (auth, users, workspaces, documents, chat)
│   │   ├── core/            # Configuración, seguridad, logging, excepciones
│   │   ├── db/               # Sesión, dependencias y migraciones (Alembic)
│   │   ├── models/           # Modelos ORM (SQLAlchemy)
│   │   ├── rag/               # Pipeline RAG: chunking, embeddings, retrieval, vectordb, generation
│   │   ├── repositories/     # Acceso a datos
│   │   ├── schemas/          # Contratos Pydantic de entrada/salida
│   │   ├── services/         # Lógica de negocio
│   │   └── storage/          # Almacenamiento local de archivos subidos
│   ├── Dockerfile
│   └── alembic.ini
├── frontend/                # Aplicación cliente (React + Vite + TypeScript)
│   ├── src/
│   │   ├── api/             # Cliente HTTP hacia el backend
│   │   ├── components/      # Componentes reutilizables de UI
│   │   └── pages/           # Login, Registro, Workspaces, Documentos, Chat
│   └── Dockerfile
├── docker-compose.yml       # Orquestación de servicios (postgres, qdrant, backend, frontend)
├── pyproject.toml           # Dependencias del backend (gestionadas con uv)
└── uv.lock
```

- **backend/** — API construida con FastAPI, responsable de la autenticación, la gestión de workspaces/documentos y el pipeline RAG (extracción → chunking → embeddings → Qdrant → retrieval → generación con OpenAI).
- **frontend/** — SPA en React que consume la API del backend (login, registro, workspaces, carga de documentos y chat).
- **docker-compose.yml** — Orquesta los 4 servicios del proyecto: PostgreSQL, Qdrant, backend y frontend.
- **pyproject.toml** / **uv.lock** — Gestión de dependencias del backend mediante `uv`.

---

# 📅 Roadmap

- [x] Diseño de la arquitectura
- [x] Backend
- [x] Base de datos
- [x] Autenticación
- [x] Gestión de Workspaces
- [x] Ingesta de documentos (PDF, DOCX, XLSX, TXT)
- [x] Embeddings
- [x] Base vectorial
- [x] Chat IA
- [x] Frontend
- [x] Docker
- [ ] Despliegue

---

# 📄 Licencia

MIT License
