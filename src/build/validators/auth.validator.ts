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

export function validators(email:String, password:String){
	let validation = {
		status: true as Boolean, //false, significa que fallo la comprobación de validación
		messages: [] as String[]
	}
	if(!email.includes("@")){
		validation.status = false
		validation.messages.push("El correo electrónico ingresado no es válido (@).")
	}
	if(password.length < 8){
		validation.status = false
		validation.messages.push("La contraseña tiene que tener al menos 8 caracteres.")
	}
	return validation
}