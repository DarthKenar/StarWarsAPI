# STAR WARS API para Kairox

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
