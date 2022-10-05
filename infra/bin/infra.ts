#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DmsStack } from '../lib/stacks/dms-stack';
import { Config } from '../lib/configs/loader';

const app = new cdk.App();
new DmsStack(app, `${Config.Ns}DmsStack`, {
  vpcId: Config.Dms.VpcId,
  securityGroupIds: Config.Dms.SecurityGroupIds,
  secretsManagerSecretId: Config.MySQLSource.SecretsManagerSecretId,
  kafkaBroker: Config.KafkaTarget.Broker,
  kafkaTopic: Config.KafkaTarget.Topic,
  env: {
    account: Config.AWS.Account,
    region: Config.AWS.Region,
  },
});

const tags = cdk.Tags.of(app);
tags.add('namespace', Config.Ns);
tags.add('stage', Config.Stage);

app.synth();
