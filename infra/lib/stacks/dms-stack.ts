import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { ReplicationInstance } from './constructs/replication-instance';
import { AuroraMySQLSourceEndpoint } from './constructs/aurora-source-endpoint';
import { KafkaTargetEndpoint } from './constructs/kafka-target-endpoint';
import { Config } from '../configs/loader';
import { CdcReplicationTask } from './constructs/cdc-replication-task';

interface IProps extends cdk.StackProps {
  readonly vpcId: string;
  readonly securityGroupIds?: string[];
  readonly secretsManagerSecretId: string;
  readonly kafkaBroker: string;
  readonly kafkaTopic: string;
}

export class DmsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'Vpc', { vpcId: props.vpcId });

    const replicationInstance = new ReplicationInstance(
      this,
      `ReplicationInstance`,
      {
        vpc,
        instanceName: `${Config.Ns.toLowerCase()}`,
        replicationInstanceClass: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.MEDIUM
        ),
        multiAz: false,
        securityGroupIds: props.securityGroupIds,
      }
    );

    const source = new AuroraMySQLSourceEndpoint(
      this,
      `AuroraMySQLSourceEndpoint`,
      {
        endpointName: `${Config.Ns.toLowerCase()}-mysql-source`,
        secretsManagerSecretId: props.secretsManagerSecretId,
      }
    );

    const target = new KafkaTargetEndpoint(this, `KafkaTargetEndpoint`, {
      endpointName: `${Config.Ns.toLowerCase()}-kafka-target`,
      kafkaBrokers: props.kafkaBroker,
      topic: props.kafkaTopic,
    });

    new CdcReplicationTask(this, `CdcReplicationTask`, {
      taskName: `${Config.Ns.toLowerCase()}-cdc`,
      fullLoad: true,
      replicationInstanceArn: replicationInstance.replicationInstance.ref,
      sourceEndpointArn: source.endpoint.ref,
      targetEndpointArn: target.endpoint.ref,
    });
  }
}
