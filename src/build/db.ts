import { Pool } from 'pg';

//Configuracion local
const pool = new Pool({
  user: 'starwars',
  host: 'localhost',
  database: 'STARWARSAPI',
  password: 'starwars',
  port: 5432,
});

export default pool;