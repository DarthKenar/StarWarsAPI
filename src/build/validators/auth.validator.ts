//TODO:
/*
Ejemplo:
validation: {
	status: false, //false, significa que fallo la comprobación de validación
	messages: [
		"mensaje de error 1",
		"mensaje de error 2",
		"mensaje de error 3"
	]
}
Hacer uso de validadores en esta etapa (que devuelvan booleanos para responder con errores en este mismo controller)
para correo correcto (que devuelva un objeto con un booleano lista de mensajes para responder con errores en este mismo controller) 
(usar los mismos validadores que en login para comprobar si un correo es correcto por ejemplo)

1/23/2014  Intel Core i7-2700K CPU @ 3.50 GHz

| Cost | Iterations        |    Duration |
|------|-------------------|-------------|
|  8   |    256 iterations |     38.2 ms | <-- minimum allowed by BCrypt
|  9   |    512 iterations |     74.8 ms |
| 10   |  1,024 iterations |    152.4 ms | <-- current default (BCRYPT_COST=10)
| 11   |  2,048 iterations |    296.6 ms |
| 12   |  4,096 iterations |    594.3 ms |
| 13   |  8,192 iterations |  1,169.5 ms |
| 14   | 16,384 iterations |  2,338.8 ms |
| 15   | 32,768 iterations |  4,656.0 ms |
| 16   | 65,536 iterations |  9,302.2 ms |

*/

export function validators(email, password){
  
	let validation = {
						status: true, //false, significa que fallo la comprobación de validación
						messages: []
					}
	return validation
}