import * as path from 'path';
import * as joi from 'joi';
import * as dotenv from 'dotenv';
import { VpcValidator } from './validators';

interface IConfig {
  AWS: {
    Account: string;
    Region: string;
  };
  Ns: string;
  Stage: string;
  Dms: {
    VpcId: string;
    SecurityGroupIds: string[];
  };
  MySQLSource: {
    SecretsManagerSecretId: string;
  };
  KafkaTarget: {
    Broker: string;
    Topic: string;
  };
}

dotenv.config({
  path: path.resolve(__dirname, '..', '..', '.env'),
});
console.debug('process.env', process.env);

const schema = joi
  .object({
    AWS_ACCOUNT_ID: joi.number().required(),
    AWS_REGION: joi.string().required(),
    NS: joi.string().required(),
    STAGE: joi.string().required(),
    VPC_ID: joi.string().custom(VpcValidator).required(),
    SECURITY_GROUP_IDS: joi.string().required(),
    SECRETS_MANAGER_ARN: joi.string().required(),
    KAFKA_BROKER: joi.string().required(),
    KAFKA_TOPIC: joi.string().required(),
  })
  .unknown();

const { value: envVars, error } = schema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const Config: IConfig = {
  AWS: {
    Account: `${envVars.AWS_ACCOUNT_ID}`,
    Region: envVars.AWS_REGION,
  },
  Ns: `${envVars.NS}${envVars.STAGE}`,
  Stage: envVars.STAGE,
  Dms: {
    VpcId: envVars.VPC_ID,
    SecurityGroupIds: envVars.SECURITY_GROUP_IDS.split(',').filter(Boolean),
  },
  MySQLSource: {
    SecretsManagerSecretId: envVars.SECRETS_MANAGER_ARN,
  },
  KafkaTarget: {
    Broker: envVars.KAFKA_BROKER,
    Topic: envVars.KAFKA_TOPIC,
  },
};

console.log('Config', Config);
