import Hashids from 'hashids';

// El '10' es la longitud mínima que tendrán los códigos (ej: a1b2c3d4e5).
const hashids = new Hashids(process.env.SECRET_KEY_HASH_ID || "clave-secreta-para-hash-ids", 10);

export const codificarId = (id: number): string => {
  if (!id) return '';
  return hashids.encode(id);
};

export const decodificarId = (hash: string): number | null => {
  if (!hash) return null;
  
  const decodificado = hashids.decode(hash);
  if (decodificado.length === 0) {
    return null;
  }
  
  return Number(decodificado[0]);
};