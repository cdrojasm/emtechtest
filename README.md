---

# Prueba tecnica Emtelco

Este proyecto es una aplicación de chat con inteligencia artificial que demuestra la orquestación de múltiples servicios y la integración de un modelo de lenguaje para interacciones conversacionales.

---

## 🚀 Despliegue

El proyecto se despliega fácilmente utilizando Docker Compose. Sigue estos pasos:

1.  **Variables de Entorno:** Se han proporcionado los archivos de variables de entorno completos en la carpeta `.envs/`. Para que la aplicación funcione correctamente, solo necesitas agregar tu **API Key de OpenAI** al archivo `.envs/.api`. Abre este archivo y asigna tu clave a la variable `LLM_API_KEY`:

    ```
    LLM_API_KEY=tu_api_key_de_openai_aqui
    ```

2.  **Ejecutar Docker Compose:** Una vez que hayas configurado la API Key, despliega el proyecto ejecutando el siguiente comando en la terminal desde la raíz del proyecto:

    ```bash
    docker compose --env-file .envs/.infra up
    ```

    Este comando levantará todos los servicios necesarios para que la aplicación funcione, estando en la raiz del proyecto al momento de ejecutarlo.

---

## 🛠️ Funcionamiento y Diseño

El proyecto está diseñado como una orquestación de **cuatro servicios** principales, junto con un contenedor auxiliar para la carga de documentos:

* **`db` (Base de Datos):** Este servicio se encarga de almacenar toda la información relevante de la aplicación, incluyendo **usuarios**, **chats** y **mensajes**.
* **`api` (API Principal):** Implementada en **FastAPI**, esta API maneja todas las solicitudes de la aplicación. Es el punto central para la gestión de usuarios, la lógica del chat y la comunicación en tiempo real a través de **WebSockets**.
* **`web` (Interfaz Gráfica):** Una **interfaz de usuario (UI)** moderna y responsiva, construida completamente desde cero utilizando **Shadcn**. Proporciona la experiencia de **registro de usuario** y la **interfaz de chat** para los usuarios, lo anterior incluye la validacion.
* **`vector_store` (Base de Datos Vectorial):** Este servicio almacena los **embeddings** (representaciones numéricas) extraídos de los documentos proporcionados. Estos embeddings son cruciales para la funcionalidad de búsqueda semántica del bot.
* **`doc_loader` (Cargador de Documentos):** Este es un **contenedor auxiliar** diseñado para ejecutarse una única vez. Su propósito es **automatizar la carga** de los embeddings a la `vector_store`, asegurando que el bot tenga acceso a la información relevante desde el inicio.

---

## 🤖 Estrategia del Bot

La inteligencia del bot se basa en una combinación de técnicas para proporcionar respuestas precisas y mantener una conversación fluida:

* **Agente con Herramientas:** Se ha empleado un **agente inteligente** que utiliza herramientas para interactuar con la `vector_store`. Esto le permite realizar **búsquedas semánticas** en los documentos almacenados y recuperar información relevante para responder a las consultas de los usuarios.
* **Grafo Básico para Conversación Casual:** Para las interacciones cotidianas y la charla casual, el bot incorpora un **grafo básico** que le permite manejar preguntas generales y mantener la fluidez de la conversación.

Esta solución está diseñada para ser **altamente expansible**. La arquitectura permite integrar fácilmente nuevas herramientas y capacidades, como la búsqueda directa en la base de datos (`db`), la conexión a APIs externas o la incorporación de modelos de lenguaje más complejos, para enriquecer aún más las capacidades del bot.