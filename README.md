# SOCless apb

- Planning on using this with a Serverless deployment? Please use our plugin [SLS-APB](https://github.com/twilio-labs/sls-apb) instead.

**SOCless Automation Playbook Builder**

Translates SOCless Playbook JSON objects into a valid CloudFormation State Machine.

It auto-generates the:

- Helper states which Task and Parallel States need to work properly in Socless
- The Yaml config required to upload the State Machine to SOCless via Cloudformation
- Task Failure handlers for all task states that will trigger when a Lambda fails
- Retry logic for all task states that will handle AWS Lambda service exceptions

## Usage

**Not for use with Serverless Deployments, instead use the SLS-APB plugin https://github.com/twilio-labs/sls-apb.**

Basic Usage

```
const { apb } = require("apb");

const renderedStateMachine = new apb(playbookJson)
```

This repository is the parsing, validation, and rendering engine for translating a SOCless json object into a complete StepFunctions State Machine.

### Writing a playbook

The default retry object assigned to each `Task` looks like this:

```json
{
  "ErrorEquals": [
    "Lambda.ServiceException",
    "Lambda.AWSLambdaException",
    "Lambda.SdkClientException"
  ],
  "IntervalSeconds": 2,
  "MaxAttempts": 6,
  "BackoffRate": 2
}
```

To **disable** default retries on certain tasks or all tasks, use the Decorators object DisableDefaultRetry:

```json
"Decorators" : {
   "DisableDefaultRetry" : {
      "tasks" : [ "End_Cheer_Up", "<other_task_name>" ],
   }
}
```

```json
"Decorators" : {
   "DisableDefaultRetry" : {
      "all" : true
   }
}
```

To automatically add a Task Failure Handler to each `Task` state that will trigger when a Lambda raises an unhandled exception, timeout, out of memory, etc :

```json
"Decorators": {
   "TaskFailureHandler": {
      Task that runs when any step in the playbook fails...
   }
}
```

## Feature Flags

To use cloudwatch logs for SOCless playbooks:

1. Ensure that you are on the most recent version of the Socless core stack which is exporting PlaybooksLogGroup as seen [here]()
2. Add the following to your playbook repo's `serverless.yml`

**serverless.yml:**

```yaml
custom:
  sls_apb:
    logging: true
```
