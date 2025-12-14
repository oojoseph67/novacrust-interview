import * as Joi from 'joi';

export default Joi.object({
  PORT: Joi.number().default(8888),
  HOST: Joi.string().default('0.0.0.0'),

  NODE_ENV: Joi.string()
    .valid('production', 'development', 'test', 'staging')
    .default('development'),

  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().port().default(5432),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_SYNC: Joi.boolean().required().default(false),

  // Railway automatically sets this environment variable
  RAILWAY_ENVIRONMENT_NAME: Joi.string()
    .valid('production', 'staging', 'development')
    .optional(),
});
