# AC4 – Gestor de Tareas Web

## 1. Explicación breve del proyecto

 
Este proyecto es una aplicación web sencilla para gestionar tareas diarias.  
El objetivo es que un usuario pueda:

- iniciar sesión (login),
- crear nuevas tareas con un título y una descripción,
- ver la lista de tareas existentes,
- marcar tareas como completadas,
- eliminar tareas que ya no necesita.

La aplicación utiliza una arquitectura web de 3 capas:

- **Front-end:** HTML, CSS y JavaScript, ejecutándose en el navegador del usuario.
- **Back-end:** un servidor Python con el framework Flask.
- **Base de datos:** una base de datos SQLite donde se guardan usuarios y tareas.

El proyecto es pequeño, pero muestra claramente cómo el front-end, el back-end y la base de datos trabajan juntos.

---

## 2. Diagrama de arquitectura


### Respuesta  
En este proyecto se utiliza una **arquitectura de 3 capas**:

1. **Front-end (cliente)**
   - Se ejecuta en el navegador (HTML + CSS + JavaScript).
   - Muestra la pantalla de login y las pantallas del gestor de tareas.
   - Envía peticiones HTTP (GET, POST, PUT, DELETE) al back-end.

2. **Back-end (servidor)**
   - Implementado con **Python + Flask**.
   - Recibe las peticiones HTTP del navegador.
   - Contiene la lógica de negocio: login, crear tareas, listar tareas, marcar como completadas, eliminar tareas.
   - Se comunica con la base de datos mediante consultas SQL.

3. **Base de datos**
   - Implementada con **SQLite**.
   - Almacena dos tablas principales:
     - `usuaris` (usuarios),
     - `tasques` (tareas).
   - El back-end lee y escribe datos en estas tablas.

Versión en texto del diagrama de arquitectura:

```text
[Usuario + Navegador (HTML/CSS/JS)]
              |
              |  HTTP (GET, POST, PUT, DELETE)
              v
       [Back-end: Python + Flask]
              |
              |  Consultas SQL
              v
       [Base de datos: SQLite]


![Diagrama de arquitectura de la aplicación](../img/diagrama-arquitectura.png)



## 3 - Justificación de las decisiones de arquitectura

El enunciado pide:

Front-end: HTML, CSS y JavaScript.

Back-end: Java, Python o Node.js.

Base de datos: SQLite, MySQL, PostgreSQL u Oracle.

En este proyecto se elige:

Front-end: HTML + CSS + JavaScript “puro” (sin framework)

Motivo: Son las tecnologías web básicas.

Son fáciles de entender para un principiante.

Cumplen el requisito de usar HTML, CSS y JavaScript en el front-end.

Back-end: Python con Flask

Motivo: Flask es un framework ligero y sencillo para aprender.

Permite definir rutas como /login o /tasks de forma simple.

Python es un lenguaje muy legible y adecuado para empezar con aplicaciones web.

Base de datos: SQLite

Motivo: SQLite es una base de datos basada en un solo archivo .db.

No necesita instalar ni configurar un servidor de base de datos.

Es suficiente para una aplicación pequeña con pocos usuarios y tareas.

Esta combinación (HTML/CSS/JS + Flask + SQLite) respeta todos los requisitos técnicos del enunciado y es adecuada para un nivel inicial (nivel 0) porque la arquitectura es clara y sencilla.




## 4 Diagrama Entidad–Relación (ER) y SQL de creación


4.1. Diagrama ER (descripción en texto)

Para permitir que cada usuario tenga sus propias tareas y pueda hacer login, se definen dos entidades:

Usuari (Usuario)

id (PK)

nom

email

password_hash

Tasca (Tarea)

id (PK)

titol

descripcio

completada

usuari_id (FK → Usuari.id)

Relación:

Un usuario puede tener muchas tareas.

Cada tarea pertenece a un solo usuario.

Versión en texto del diagrama ER:

[USUARI]
  id (PK)
  nom
  email
  password_hash

      1     ─────────────<     N

[TASCA]
  id (PK)
  titol
  descripcio
  completada
  usuari_id (FK a USUARI.id)


5 - SQL para crear el esquema en SQLite

-- Tabla de usuarios
CREATE TABLE usuaris (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL
);

-- Tabla de tareas
CREATE TABLE tasques (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titol TEXT NOT NULL,
    descripcio TEXT,
    completada INTEGER NOT NULL DEFAULT 0,
    usuari_id INTEGER NOT NULL,
    FOREIGN KEY (usuari_id) REFERENCES usuaris(id)
);

## 5. Diseño de la lógica de negocio (back-end) y ejemplo de método

## 5.1. Lista de métodos del back-end (endpoints Flask)

Las funcionalidades mínimas son: login, crear tarea, listar tareas, marcar tarea como completada y eliminar tarea.

Se proponen los siguientes endpoints HTTP:

POST /login

Entrada: email, password.

Acción: comprueba el usuario en la tabla usuaris.

Salida: éxito o error (por ejemplo, JSON con mensaje o redirección).

POST /logout (opcional, recomendable)

Acción: cierra la sesión del usuario.

Salida: confirmación.

GET /tasks

Acción: devuelve la lista de tareas del usuario autenticado.

Salida: array JSON de tareas.

POST /tasks

Entrada: datos de la nueva tarea (titol, descripcio).

Acción: crea una nueva tarea en la base de datos para el usuario actual.

Salida: confirmación y, opcionalmente, la tarea creada.

PUT /tasks/<id>

Entrada: datos actualizados de la tarea (titol, descripcio).

Acción: modifica la tarea con ese id (si pertenece al usuario).

Salida: confirmación y, opcionalmente, la tarea actualizada.

PUT /tasks/<id>/complete

Acción: marca la tarea como completada (completada = 1).

Salida: confirmación.

DELETE /tasks/<id>

Acción: elimina la tarea con ese id de la base de datos.

Salida: confirmación.

Con estos métodos se cubren todas las funcionalidades pedidas.

## 5.2. Ejemplo de código de un método (Flask, Python)

from flask import Flask, jsonify
import sqlite3

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect("tasques.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/tasks", methods=["GET"])
def get_tasks():
    # Para simplificar, asumimos que el usuario con id 1 está logueado.
    # En una aplicación real, leeríamos el id del usuario desde la sesión.
    current_user_id = 1

    conn = get_db_connection()
    rows = conn.execute(
        "SELECT id, titol, descripcio, completada "
        "FROM tasques WHERE usuari_id = ?",
        (current_user_id,)
    ).fetchall()
    conn.close()

    tasks = []
    for row in rows:
        tasks.append({
            "id": row["id"],
            "titol": row["titol"],
            "descripcio": row["descripcio"],
            "completada": bool(row["completada"])
        })

    return jsonify(tasks)


Este código es un ejemplo mínimo de cómo el back-end se conecta a la base de datos y devuelve la lista de tareas en formato JSON.

## 6. Pantallas del front-end (Figma)






## 7. Mapa de navegación

[Pantalla de Login]
    |
    |  (email y contraseña correctos)
    v
[Pantalla de Lista de Tareas]
    |
    |-- clic en "Añadir tarea" --> abre formulario de Nueva Tarea
    |
    |-- clic en "Editar" en una tarea --> abre formulario de Editar Tarea
    |
    |-- clic en "Eliminar" en una tarea --> pide confirmación y elimina la tarea


## 8. Listado de pruebas de funcionalidad

### 8.1. Pruebas de login

Prueba L1 – Login con credenciales correctas

Pasos:

Abrir la pantalla de login.

Introducir un email válido y una contraseña correcta.

Pulsar “Login”.

Resultado esperado:

El sistema redirige a la pantalla de Lista de Tareas.

Prueba L2 – Login con contraseña incorrecta

Pasos:

Abrir la pantalla de login.

Introducir un email válido pero contraseña incorrecta.

Pulsar “Login”.

Resultado esperado:

El usuario se queda en la pantalla de login.

Aparece un mensaje de error como “Email o contraseña incorrectos”.

### 8.2. Pruebas de creación de tareas

Prueba T1 – Crear tarea con datos válidos

Pasos:

Iniciar sesión.

En la pantalla de Lista de Tareas, rellenar “Título de la tarea” y “Descripción”.

Pulsar “Añadir tarea”.

Resultado esperado:

La nueva tarea aparece en el listado.

Los campos del formulario se vacían.

Prueba T2 – Crear tarea sin título

Pasos:

Iniciar sesión.

Dejar vacío el campo de título y rellenar solo la descripción.

Pulsar “Añadir tarea”.

Resultado esperado:

La tarea no se crea.

Aparece un mensaje de error tipo “El título es obligatorio”.

### 8.3. Pruebas de listado de tareas

Prueba T3 – Listar tareas existentes

Pasos:

Iniciar sesión cuando ya existen varias tareas en la base de datos.

Resultado esperado:

Se muestran todas las tareas que pertenecen al usuario conectado.

### 8.4. Pruebas de marcar tarea como completada

Prueba T4 – Marcar una tarea como completada

Pasos:

Iniciar sesión.

En la lista de tareas, marcar el checkbox de “Completada” para una tarea.

Resultado esperado:

Visualmente, la tarea aparece como completada (por ejemplo, en gris o con el texto tachado).

En la base de datos, el campo completada de esa tarea pasa a valor 1.

### 8.5. Pruebas de edición de tareas

Prueba T5 – Editar una tarea

Pasos:

Iniciar sesión.

En la lista de tareas, pulsar “Editar” en una tarea existente.

Cambiar el título y/o la descripción.

Pulsar “Guardar cambios”.

Resultado esperado:

La tarea se actualiza en el listado.

En la base de datos se guardan los nuevos valores.

### 8.6. Pruebas de eliminación de tareas

Prueba T6 – Eliminar una tarea

Pasos:

Iniciar sesión.

En la lista de tareas, pulsar “Eliminar” en una tarea.

Confirmar la eliminación si aparece un diálogo de confirmación.

Resultado esperado:

La tarea desaparece del listado.

La tarea se elimina de la tabla tasques en la base de datos.

## 9. Cómo se cumplen los criterios de funcionalidad

El enunciado indica como funcionalidades mínimas: hacer login, crear tareas, listar tareas, marcar tareas como completadas y eliminar tareas.

Login:
El endpoint /login y la pantalla de Login permiten que el usuario se identifique con email y contraseña.
Las pruebas L1 y L2 comprueban el comportamiento con credenciales correctas e incorrectas.

Crear una nueva tarea:
El endpoint POST /tasks y el formulario de nueva tarea en la pantalla de Lista de Tareas permiten añadir tareas con título y descripción.
Las pruebas T1 y T2 validan que las tareas se crean correctamente y que el título es obligatorio.

Listar todas las tareas existentes:
El endpoint GET /tasks devuelve todas las tareas del usuario logueado, y la interfaz las muestra en un listado.
La prueba T3 verifica que el listado es correcto.

Marcar tareas como completadas:
El endpoint PUT /tasks/<id>/complete y el checkbox “Completada” permiten marcar una tarea como hecha.
La prueba T4 comprueba que el campo completada cambia en la base de datos y que la interfaz refleja este cambio.

Eliminar tareas:
El endpoint DELETE /tasks/<id> y el botón “Eliminar” permiten borrar tareas que ya no se necesitan.
La prueba T6 comprueba que la tarea desaparece tanto de la interfaz como de la base de datos.

Con estos endpoints, pantallas y pruebas, el diseño de la aplicación cumple todos los criterios de funcionalidad indicados en el enunciado.

