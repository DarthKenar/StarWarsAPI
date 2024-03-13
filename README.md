# STAR WARS API para Kairox

## Para ejecutar servidor local:

Clonar repo:

```Bash
git clone https://github.com/DarthKenar/StarWarsAPI
```

Vamos al directorio del proyecto:

```Bash
cd StarWarsAPI
```

Instalamos dependencias:

```Bash
npm install
```

Compilamos Javascript:

```Bash
npx tsc
```

### Ejecutamos los tests

```Bash
npm run test
```

---

### Ejecutamos el servidor:

```Bash
npm run dev
```

Documentacion local:

http://localhost:3000/api-docs

---

## Modelos - Base de Datos

[Diagrama](./src/doc/models.mmd)

---
## API Routes

| Host | Method | RoutePath | Action |
|--|--|--|--|
| localhost:3000 | GET  |`"/"`| Muestra el Home |
| localhost:3000 | GET  |`"/film/s/all"`| Muestra todas las películas  |
| localhost:3000 | GET  |`"/film/:id"`| Muestra una película |
| localhost:3000 | GET  |`"/film/s/search"`| Muestra una lista de películas por nombre |
| localhost:3000 | DELETE  |`"/film/del/:id"`| Borra una película y sus personajes asociados. |
| localhost:3000 | DELETE  |`"/film/s/del/all"`| Borra todas las películas y todos los personajes asociados |
|--|--|--|--|
| localhost:3000 | GET  |`"/api-docs"` | Muestra la documentación |

# Project Structure

```
ProjectRoot
├── dist              				    // Carpeta distribuible.
│   ├── views       				    // Carpeta de Templates.
│   │   └── layouts  				    // Diseños de templates base.
│   │   │   └── mainTemplate.handlebars   				// Template principal.
│   │   └── partials  				                    // Porciones de template como componentes para reutilizar.
│   │   │   └── checkCharacters.handlebars  			// Template que muestra si la película tiene o no personajes en la DB.
│   │   │   └── searchFilm.handlebars  				    // Buscador por nombre de película.
│   │   ├── homeTemplate.handlebars       				// Template inicial de GET a raiz "/"
│   │   ├── infoTemplate.handlebars       				// Template que muestra toda la informacion independientemente del path.
├── src              				// Carpeta de codigo fuente.
│   ├── build       				// Carpeta de compilación.
│   │   └── controllers  	 		// Carpeta contenedora de los controladores de las rutas.
│   │   │   └── film.controller.ts  // Controladores de las rutas para film.
│   │   └── routes  	 			// Carpeta de rutas de la API.
│   │   │   └── film.routes.ts     	// Rutas definidas para el modelo Film.
│   │   └── utils	                // Carpeta contenedora de funciones útiles.
│   │   │   └── film.utils.ts	    // funciones útiles para film.routes.ts.
│   │   └── app.ts  				// Archivo de centralizacion de rutas.
│   │   └── index.ts  				// Archivo de ejecucion del servidor.
│   ├── database  				    // Carpeta referente a la base de datos.
│   │   └── entity  	 			// Carpeta contenedora de los modelos.
│   │   │   └── models.ts	        // archivo de definición de los modelos de la base de datos.
│   │   └── data-source.ts  		// Archivo de configuración de la base de datos.
│   ├── docs  				        // Carpeta referente a la documentación.
│   │   └── models.mmd     		    // Diagrama de modelos realizado en mermaidchart
│   │   └── swagger.json     		// archivo de configuracion para documentación en Swagger
│   ├── tests  				        // Carpeta referente a los tests.
│   │   └── server.test.ts     		// Testeo de peticiones definidas en el archivo server.ts
├── .gitignore       				// Archivo gitignore estándar.
├── package-lock.json     		    // Dependencias de modulos exactos de Node.js
├── package.json     				// Dependencias de modulos de Node.js
├── README.md                       // Archivo Readme.md estándar.
└── tsconfig.json    				// Configuracion para compilacion de Typescript
```

# Project Dependencies 

**Prodution Dependencies** 

1. "axios": "^1.6.7",

2. "express": "^4.18.2",

3. "reflect-metadata": "^0.2.1",

4. "sqlite3": "^5.1.7",

5. "swagger-ui-express": "^5.0.0",

6. "typeorm": "^0.3.20"

**Dev Dependencies** 

1. "@types/express": "^4.17.21",

2. "@types/jest": "^29.5.12",

3. "@types/node": "^20.11.24",

4. "jest": "^29.7.0",

5. "nodemon": "^3.1.0",

6. "ts-jest": "^29.1.2",

7. "supertest": "^6.3.4",

8. "typescript": "^5.3.3"

## Objetivos

Utilizando la [API STAR WARS](https://swapi.dev/documentation), podrás obtener las películas y personajes de cada entrega.
(Requerido)

---

### Desafío 1

Es necesario tener todas las películas, para ello debemos guardar en una base local todas las películas con los campos que creas necesarios. Inicialmente se consulta a la BD local preguntando si existen esas películas, si no existen vamos a la API y guardamos las películas localmente para optimizar los tiempos de respuesta y no ir cada vez a la API externa.

### Desafío 2

Al consultar cada película esta tiene que guardar en una base local todos los personajes relacionados a esta con los campos nombre, género, películas y especie. Inicialmente se consulta a la BD local preguntando si existen esos personajes, si no existen vamos a la API y guardamos los personajes localmente para optimizar los tiempos de respuesta y no ir cada vez a la API externa.

### Desafío 3

Crear un endpoint que borre los personajes de la película indicada de la base de datos. Crear un endpoint que borre TODOS los datos de la Base de datos.

---

#### Desafío Opcional (Bonus extra)

- Hacer un buscador de películas, especies.

- Implementar login user y pass. Middleware de verificación token. (authentication)

##### Aclaraciones

- Usar Node js (Typescript)
- Utilizar Swagger para la documentación de la API (no excluyente)
- La BD puede ser cualquiera
- Se debe exponer el endpoint de consulta de películas para ser utilizada
- Proponer diseño y lógica en cada desafío.
- Se puede subir a github/gitlab y compartir el link o bien un zip.
- Proponer manejo de errores (404, 401, 400, 500)
