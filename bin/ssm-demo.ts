#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { SsmDemoStack } from '../lib/ssm-demo-stack';

const app = new cdk.App();

// Update valid AWS account Id
new SsmDemoStack(app, 'SsmDemoStack', { env: { region: 'us-east-2', account: '123456789' }});
