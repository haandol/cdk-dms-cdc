import { Construct } from 'constructs';
import * as dms from 'aws-cdk-lib/aws-dms';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

interface IProps {
  vpc: ec2.IVpc;
  instanceName: string;
  replicationInstanceClass: ec2.InstanceType;
  multiAz: boolean;
  securityGroupIds?: string[];
  allocatedStorage?: number;
}

export class ReplicationInstance extends Construct {
  public readonly replicationInstance: dms.CfnReplicationInstance;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    const subnetGroup = new dms.CfnReplicationSubnetGroup(
      this,
      'ReplicationSubnetGroup',
      {
        subnetIds: props.vpc.privateSubnets.map((subnet) => subnet.subnetId),
        replicationSubnetGroupIdentifier: `default-${props.vpc.vpcId}`,
        replicationSubnetGroupDescription: 'Subnet group for DMS',
      }
    );

    this.replicationInstance = new dms.CfnReplicationInstance(
      this,
      'DmsReplicationInstance',
      {
        replicationInstanceClass: `dms.${props.replicationInstanceClass.toString()}`,
        allowMajorVersionUpgrade: false,
        autoMinorVersionUpgrade: true,
        multiAz: props.multiAz,
        replicationInstanceIdentifier: props.instanceName,
        publiclyAccessible: false,
        replicationSubnetGroupIdentifier: subnetGroup.ref,
        vpcSecurityGroupIds: props.securityGroupIds || [],
        allocatedStorage: props.allocatedStorage || 50,
      }
    );
  }
}
