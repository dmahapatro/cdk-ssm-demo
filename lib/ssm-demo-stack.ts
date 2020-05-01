import * as cdk from '@aws-cdk/core';
import { MachineImage, InstanceType, Vpc, SecurityGroup, Peer, Port, BlockDeviceVolume, UserData } from '@aws-cdk/aws-ec2';
import { AutoScalingGroup } from '@aws-cdk/aws-autoscaling';
import { ApplicationLoadBalancer } from '@aws-cdk/aws-elasticloadbalancingv2';
import { Role, ServicePrincipal, CompositePrincipal, ManagedPolicy, PolicyStatement, Effect } from '@aws-cdk/aws-iam';
import { Topic } from '@aws-cdk/aws-sns';
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';
import * as fs from 'fs';
import { Tag } from '@aws-cdk/core';

export class SsmDemoStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = Vpc.fromLookup(this, 'DefaultVPC', {
      isDefault: true
    });

    const blockDevice = BlockDeviceVolume.ebs(8, {
      encrypted: true,
      deleteOnTermination: true
    });

    const userData = UserData.forLinux();
    userData.addCommands(fs.readFileSync('lib/httpd.sh','utf8'));

    const asg = new AutoScalingGroup(this, "ASG", {
      userData,
      vpc,
      instanceType: new InstanceType('t2.micro'),
      machineImage: MachineImage.latestAmazonLinux(),
      blockDevices: [{
        deviceName: '/dev/xvda',
        volume: blockDevice
      }]
    });

    Tag.add(asg, 'purpose', 'lunch_and_learn');

    const alb = new ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
    });

    const listener = alb.addListener('Listener', {
      port: 80,
    });

    listener.addTargets('Target', {
      port: 80,
      targets: [asg]
    });

    listener.connections.allowDefaultPortFromAnyIpv4('Open to the worlds');

    const ssmAutomationServiceRole = new Role(this, 'SSMAutomationServiceRole', {
      assumedBy: new CompositePrincipal(
        new ServicePrincipal('ssm.amazonaws.com'),
        new ServicePrincipal('ec2.amazonaws.com')
      )
    });

    ssmAutomationServiceRole.addManagedPolicy(
      ManagedPolicy.fromManagedPolicyArn(this, 'AutomationAssumeRole', 'arn:aws:iam::aws:policy/service-role/AmazonSSMAutomationRole')
    );

    ssmAutomationServiceRole.addToPolicy(
      new PolicyStatement({
        resources: [ssmAutomationServiceRole.roleArn],
        actions: ['iam:PassRole'],
        effect: Effect.ALLOW
      })
    );

    ssmAutomationServiceRole.addToPolicy(
      new PolicyStatement({
        resources: ['*'],
        actions: [            
          "autoscaling:DescribeAutoScalingInstances",
          "autoscaling:DetachInstances",
          "ec2:DescribeInstances",
          "ec2:ModifyInstanceAttribute",
          "ec2:ModifyNetworkInterfaceAttribute",
          "ec2:ModifyImageAttribute",
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey",
          "sns:Publish"
        ],
        effect: Effect.ALLOW
      })
    );

    const topic = new Topic(this, 'Topic', {
      topicName: "IRTopic",
      displayName: 'Incident Response Notification'
    });

    // Update valid email address
    topic.addSubscription(new EmailSubscription('email@domain.com'));

    // const file = path.join(__dirname, './documents/AutomationDocument.yaml');
    // new CfnDocument(this, 'AutomationDocument', {
    //   documentType: 'Automation',
    //   name: 'TestSSMAutomationDocument',
    //   content: fs.readFileSync(file,'utf8').toString()
    // });
  }
}
