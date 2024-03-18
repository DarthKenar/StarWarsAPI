//Bcrypt Config
const bcrypt = require('bcrypt');
const saltRounds = 10;

export async function encryptPassSync(password:string):Promise<string>{
    // https://www.npmjs.com/package/bcrypt
    return await bcrypt.hashSync(password, saltRounds);
}

export async function comparePassSync(password1:string,password2:string):Promise<boolean>{
    return (bcrypt.compareSync(password1,password2))
}
