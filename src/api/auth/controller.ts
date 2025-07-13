import { Request, ResponseToolkit } from '@hapi/hapi';
import * as authService from '../../services/auth.service';

export const register = async (req: Request, h: ResponseToolkit) => {
  const { email, password, name } = req.payload as { email: string; password: string; name: string };

  const result = await authService.register({ email, password, name });

  return h
    .response({ message: result.message, data: result.success ? result.data : undefined })
    .code(result.code);
};

export const login = async (req: Request, h: ResponseToolkit) => {
  const { email, password } = req.payload as { email: string; password: string };

  const result = await authService.login({ email, password });

  return h
    .response({ message: result.message, data: result.success ? result.data : undefined })
    .code(result.code);
}; 