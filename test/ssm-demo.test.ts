import { expect as expectCDK, haveResource, countResources } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as SsmDemo from '../lib/ssm-demo-stack';

const environment = { 
  env: { 
    region: 'us-east-2', 
    account: '1234' 
  }
};

test('EC2 Instance Created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new SsmDemo.SsmDemoStack(app, 'MyTestStack', environment);
    // THEN
    expectCDK(stack).to(haveResource("AWS::AutoScaling::AutoScalingGroup"));
});

test('SNS Topic Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new SsmDemo.SsmDemoStack(app, 'MyTestStack', environment);
  // THEN
  expectCDK(stack).to(haveResource("AWS::SNS::Topic"));
});

test('SSM Assume Role Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new SsmDemo.SsmDemoStack(app, 'MyTestStack', environment);

  // THEN
  expectCDK(stack).to(haveResource("AWS::IAM::Role", {
    "AssumeRolePolicyDocument": {
      "Statement": [
        {
          "Action": "sts:AssumeRole",
          "Effect": "Allow",
          "Principal": {
            "Service": [
              "ssm.amazonaws.com",
              "ec2.amazonaws.com"
            ]
          }
        }
      ],
      "Version": "2012-10-17"
    },
    "ManagedPolicyArns": [
      "arn:aws:iam::aws:policy/service-role/AmazonSSMAutomationRole"
    ]
  }));
  
  expectCDK(stack).to(countResources("AWS::IAM::Policy", 1));
});
