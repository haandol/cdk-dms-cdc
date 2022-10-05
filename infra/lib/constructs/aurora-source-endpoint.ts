import { Construct } from 'constructs';
import * as dms from 'aws-cdk-lib/aws-dms';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Config } from '../configs/loader';

interface IProps {
  endpointName: string;
  secretsManagerSecretId: string;
}

export class AuroraMySQLSourceEndpoint extends Construct {
  public readonly endpoint: dms.CfnEndpoint;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    const role = new iam.Role(this, 'DmsSourceSecretsRole', {
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
      endpointType: 'source',
      engineName: 'aurora',
      mySqlSettings: {
        eventsPollInterval: 5,
        maxFileSize: 512,
        parallelLoadThreads: 1,
        secretsManagerAccessRoleArn: role.roleArn,
        secretsManagerSecretId: props.secretsManagerSecretId,
        serverTimezone: 'Asia/Seoul',
      },
    });
  }
}
