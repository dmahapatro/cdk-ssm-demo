#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { SsmDemoStack } from '../lib/ssm-demo-stack';

const app = new cdk.App();
new SsmDemoStack(app, 'SsmDemoStack');
