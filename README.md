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

#### Validating a Playbook Definition

Use the `validatePlaybook` function as shown below to validate a playbook definition

```
import {validatePlaybook} from "apb/dist/validators"
// const {validatePlaybook} = require("apb/dist/validators" ) // for non-es6

const validationResult = validatePlaybook(definition)
```

validationResult conforms to the ValidationResult interface shown below

```json
{
  "isValid": "boolean",
  "errors": [
    {
      "errorCode": "SCHEMA_VALIDATION_ERROR",
      "message": "string"
    }
  ]
}
```

#### Validating a State Definition

Use `validateState` function to validate a Playbook State Config.

```
import {validateState} from "apb/dist/validators"

validateState({Type: "Task", "Resource": "${{self:custom.Resource}}", Next: "StateHere"})
// returns { isValid: true, errors: [] }


validateState({Type: "Task", Next: "StateHere"})

// returns
// {
//   isValid: false,
//   errors: [
//     {
//       message: '"Resource" is required.',
//       errorCode: 'SCHEMA_VALIDATION_ERROR'
//     }
//   ]
// }


validateState(2)
// returns
// {
//   isValid: false,
//   errors: [
//     {
//       errorCode: 'TYPE_ERROR',
//       message: "Provided input is of incorrect type. Expected 'object', received number"
//     }
//   ]
// }
```

### Rendering ASL State machines from playbooks

To render Amazon States Language state machines from playbooks...

```
import {apb} from "apb";
// const { apb } = require("apb"); // for non-es6

const {StateMachine} = new apb(playbookJson)
```

This repository is the parsing, validation, and rendering engine for translating a SOCless json object into a complete StepFunctions State Machine.

## Things to note for when Writing a playbook

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
