# Demo App to show SSM Automation Document Execution

In order to create the stack in `us-east-2` region, provide below details:
 - Valid AWS account Id in `bin/ssm-demo.ts`
 - Valid email address in `lib/ssm-demo-stack.ts`
 
## Create Stack
Run command:  

`npm run build` to build the app

or

`cdk deploy` to build and deploy the stack

## SSM Document
Manually upload the document from `lib/documents/AutomationDocument.yaml` in SSM Document under your AWS account

> The CDK stack was not able to create the document, hence manual approach

### Automation Execution
The automation execution expects few parameters, provide those parameters like:
 - SSM Automation Assume Role (created by the stack)
 - Compromised Instance Id (created by the stack)
 - Notification ARN (arn of SNS topic created by the stack)
 
> Also make sure the SNS email subscrption is valid

Now, run the execution and follow the steps of execution.

Done

# CDK Information

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
