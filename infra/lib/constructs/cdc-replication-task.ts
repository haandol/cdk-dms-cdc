import { Construct } from 'constructs';
import * as dms from 'aws-cdk-lib/aws-dms';

interface IProps {
  taskName: string;
  fullLoad: boolean;
  replicationInstanceArn: string;
  sourceEndpointArn: string;
  targetEndpointArn: string;
}

export class CdcReplicationTask extends Construct {
  public readonly task: dms.CfnReplicationTask;

  constructor(scope: Construct, id: string, props: IProps) {
    super(scope, id);

    const tableMappings = {
      rules: [
        {
          'rule-type': 'selection',
          'rule-id': '1',
          'rule-name': '1',
          'rule-action': 'explicit',
          'object-locator': {
            'schema-name': 'saga',
            'table-name': 'outboxes',
          },
        },
        {
          'rule-type': 'object-mapping',
          'rule-id': '2',
          'rule-name': '2',
          'rule-action': 'map-record-to-record',
          'object-locator': {
            'schema-name': 'saga',
            'table-name': 'outboxes',
          },
          'mapping-parameters': {
            'partition-key-type': 'schema-table',
          },
        },
      ],
    };

    const taskSettings = {
      Logging: {
        EnableLogging: true,
      },
    };

    this.task = new dms.CfnReplicationTask(this, 'DmsReplicationTask', {
      replicationTaskIdentifier: props.taskName,
      migrationType: props.fullLoad ? 'full-load-and-cdc' : 'cdc',
      replicationInstanceArn: props.replicationInstanceArn,
      sourceEndpointArn: props.sourceEndpointArn,
      tableMappings: JSON.stringify(tableMappings),
      targetEndpointArn: props.targetEndpointArn,
      replicationTaskSettings: JSON.stringify(taskSettings),
    });
  }
}
