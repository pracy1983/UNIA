import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { validateCPF } from '../utils/validation.js';

export const register = async (req: Request, res: Response) => {
  const { email, password, displayName, fullName, cpf, birthDate } = req.body;

  if (!cpf || !birthDate || !fullName || !email || !password) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios (Nome Real, CPF, Nascimento, E-mail e Senha)' });
  }

  // Validação de CPF
  if (!validateCPF(cpf)) {
    return res.status(400).json({ message: 'CPF inválido. Verifique os números.' });
  }

  try {
    // Check if email or CPF already exists
    const userCheck = await query('SELECT id FROM users WHERE email = $1 OR cpf = $2', [email, cpf]);
    if (userCheck.rowCount && userCheck.rowCount > 0) {
      return res.status(400).json({ message: 'E-mail ou CPF já cadastrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (email, password_hash, display_name, full_name, cpf, birth_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, display_name, full_name, cpf, birth_date',
      [email, passwordHash, displayName || fullName, fullName, cpf, birthDate]
    );

    // Create a default Solo node for the user
    const newUser = result.rows[0];
    await query(
      'INSERT INTO nodes (owner_id, name, type) VALUES ($1, $2, $3)',
      [newUser.id, 'Meu Cantinho', 'solo']
    );

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ user: newUser, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno ao criar conta.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (!result.rowCount || result.rowCount === 0) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro interno ao fazer login.' });
  }
};
