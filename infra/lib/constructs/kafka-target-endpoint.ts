import { Construct } from 'constructs';
import * as dms from 'aws-cdk-lib/aws-dms';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Config } from '../configs/loader';

interface IProps {
  endpointName: string;
  kafkaBrokers: string;
  topic: string;
}

export class KafkaTargetEndpoint extends Construct {
  public readonly endpoint: dms.CfnEndpoint;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    const role = new iam.Role(this, 'DmsSecretsRole', {
      assumedBy: new iam.ServicePrincipal(
        `dms.${Config.AWS.Region}.amazonaws.com`
      ),
      managedPolicies: [
        { managedPolicyArn: 'arn:aws:iam::aws:policy/SecretsManagerReadWrite' },
        {
          managedPolicyArn:
            'arn:aws:iam::aws:policy/AWSKeyManagementServicePowerUser',
        },
      ],
    });
    role.grantPassRole(new iam.AnyPrincipal());

    this.endpoint = new dms.CfnEndpoint(this, 'DmsEndpoint', {
      endpointIdentifier: props.endpointName,
      endpointType: 'target',
      engineName: 'kafka',
      kafkaSettings: {
        broker: props.kafkaBrokers,
        topic: props.topic,
        includeNullAndEmpty: true,
        securityProtocol: 'ssl-encryption',
      },
    });
  }
}
