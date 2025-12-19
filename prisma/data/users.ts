import * as bcrypt from 'bcryptjs';

export interface SeedUser {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'user';
}

export const users: SeedUser[] = [
  {
    email: 'admin@teslo.com',
    name: 'Admin User',
    password: bcrypt.hashSync('123456', 10),
    role: 'admin',
  },
  {
    email: 'user@teslo.com',
    name: 'Regular User',
    password: bcrypt.hashSync('123456', 10),
    role: 'user',
  },
  {
    email: 'nca1478@gmail.com',
    name: 'Nelson Cadenas',
    password: bcrypt.hashSync('123456', 10),
    role: 'admin',
  },
  {
    email: 'mailjet1478@gmail.com',
    name: 'Pedro Perez',
    password: bcrypt.hashSync('123456', 10),
    role: 'user',
  },
];
