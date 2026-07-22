import { httpServer } from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

httpServer.listen(env.port, () => {
  logger.info(`Server running on port ${env.port}`);
});
