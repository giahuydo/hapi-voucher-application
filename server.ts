import Hapi from '@hapi/hapi';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Agenda } from 'agenda';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import HapiSwagger from 'hapi-swagger';
import voucherRoutes from './src/api/voucher/routes';
import authRoutes from './src/api/auth/routes';
import eventRoutes from './src/api/event/routes';
import unlockVoucherLocksJob from './agenda/jobs/unlockVoucherLocks.job';
import HapiAuthJwt2 from 'hapi-auth-jwt2';


dotenv.config();

// Validate JWT payload
const validateJWT = async (decoded: any, request: Hapi.Request, h: Hapi.ResponseToolkit) => {
  if (!decoded || !decoded.userId) {
    return { isValid: false };
  }
  return {
    isValid: true,
    credentials: { id: decoded.userId }
  };
};

const init = async () => {
  try {
    const server = Hapi.server({
      port: process.env.PORT || 3000,
      host: "0.0.0.0",
    });

    // Route test
    server.route({
      method: 'GET',
      path: '/',
      handler: () => ({ message: '🎉 Hapi server is running!' })
    });
    // Register JWT Auth
    await server.register(HapiAuthJwt2);

    server.auth.strategy('jwt', 'jwt', {
      key: process.env.JWT_SECRET || 'default_secret',
      validate: validateJWT,
      verifyOptions: { algorithms: ['HS256'] },
    });

    server.auth.default('jwt'); // Protect all routes by default

    // Swagger
    await server.register([
      Inert,
      Vision,
      {
        plugin: HapiSwagger,
        options: {
          info: {
            title: 'Voucher API',
            version: '1.0.0',
            description: 'API documentation for Voucher Management System'
          },
          tags: [
            { name: 'api', description: 'API endpoints' },
            { name: 'auth', description: 'Authentication endpoints' }
          ],
          documentationPath: '/documentation'
        }
      }
    ]);

    // MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/voucher_app';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Routes
    server.route(voucherRoutes);
    server.route(authRoutes);
    server.route(eventRoutes);

    // Start server
    await server.start();
    console.log(`🚀 Server running at ${server.info.uri}`);
    console.log(`📚 Swagger available at ${server.info.uri}/documentation`);


    // Agenda
    const agenda = new Agenda({
      mongo: mongoose.connection.db as any,
      processEvery: '1 minute'
    });
    unlockVoucherLocksJob(agenda);
    await agenda.start();
    console.log('✅ Agenda started');

  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err);
  process.exit(1);
});

init();

