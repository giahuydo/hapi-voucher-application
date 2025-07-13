import jwt from 'jsonwebtoken';
import User, { UserDocument } from '../models/user.model';
import { AppError, ValidationError, NotFoundError } from '../../utils/errorHandler';
import { transformResponse } from '../../utils/response';
import logger from '../../utils/logger';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  code: number;
  data?: {
    token: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  };
}

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  try {
    logger.info(`Starting user registration for email: ${input.email}`);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      logger.warn(`Registration failed - User already exists: ${input.email}`);
      return {
        success: false,
        message: 'User already exists with this email',
        code: 409
      };
    }

    // Create new user
    const user = new User({
      email: input.email,
      password: input.password,
      name: input.name
    });

    await user.save();
    logger.info(`User registered successfully: ${input.email}`);

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const token = (jwt as any).sign(
      { userId: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return {
      success: true,
      message: 'User registered successfully',
      code: 201,
      data: {
        token,
        user: {
          id: (user._id as any).toString(),
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    };
  } catch (error: any) {
    logger.error(`Registration failed for email ${input.email}:`, {
      error: error?.message || 'Unknown error',
      stack: error?.stack
    });
    
    return {
      success: false,
      message: 'Registration failed',
      code: 500
    };
  }
};

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  try {
    logger.info(`Starting login attempt for email: ${input.email}`);
    
    // Find user by email
    const user = await User.findOne({ email: input.email });
    if (!user) {
      logger.warn(`Login failed - User not found: ${input.email}`);
      return {
        success: false,
        message: 'Invalid credentials',
        code: 401
      };
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn(`Login failed - Account deactivated: ${input.email}`);
      return {
        success: false,
        message: 'Account is deactivated',
        code: 401
      };
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      logger.warn(`Login failed - Invalid password for: ${input.email}`);
      return {
        success: false,
        message: 'Invalid credentials',
        code: 401
      };
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const token = (jwt as any).sign(
      { userId: user._id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    logger.info(`Login successful for user: ${input.email}`);
    
    return {
      success: true,
      message: 'Login successful',
      code: 200,
      data: {
        token,
        user: {
          id: (user._id as any).toString(),
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    };
  } catch (error: any) {
    logger.error(`Login failed for email ${input.email}:`, {
      error: error?.message || 'Unknown error',
      stack: error?.stack
    });
    
    return {
      success: false,
      message: 'Login failed',
      code: 500
    };
  }
};

export const verifyToken = (token: string) => {
  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    const decoded = (jwt as any).verify(token, jwtSecret);
    logger.debug(`Token verified successfully for user: ${decoded?.email || 'unknown'}`);
    return decoded;
  } catch (error: any) {
    logger.warn(`Token verification failed: ${error?.message || 'Unknown error'}`);
    return null;
  }
}; 