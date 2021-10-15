"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSON_SCHEMA_VERSION = exports.JSON_SCHEMA_ID_BASE_URI = exports.AWS_EVENT_RULE_RESOURCE_TYPE = exports.STATES_EXECUTION_ROLE_ARN = exports.SOCLESS_CORE_LAMBDA_NAME_FOR_RUNNING_PLAYBOOK_SETUP = exports.PLAYBOOK_SETUP_STEP_NAME = exports.PLAYBOOK_DIRECT_INVOCATION_CHECK_STEP_NAME = exports.PLAYBOOK_FORMATTER_STEP_NAME = exports.DECORATOR_FLAGS = exports.DEFAULT_RETRY = exports.PARSE_SELF_PATTERN = exports.PARSE_SELF_REGEX_STRING = exports.PARSE_SELF_NAME = void 0;
exports.PARSE_SELF_NAME = "apb_render_nonstring_value";
exports.PARSE_SELF_REGEX_STRING = "(\\\"" + exports.PARSE_SELF_NAME + "\\()(.*)(\\)\\\")";
exports.PARSE_SELF_PATTERN = new RegExp(exports.PARSE_SELF_REGEX_STRING, "g");
exports.DEFAULT_RETRY = Object.freeze({
    ErrorEquals: [
        "Lambda.ServiceException",
        "Lambda.AWSLambdaException",
        "Lambda.SdkClientException",
    ],
    IntervalSeconds: 2,
    MaxAttempts: 6,
    BackoffRate: 2,
});
exports.DECORATOR_FLAGS = Object.freeze({
    TaskFailureHandlerName: "_Handle_Task_Failure",
    TaskFailureHandlerStartLabel: "_Task_Failed",
    TaskFailureHandlerEndLabel: "_End_With_Failure",
});
// Here we explicitly assign `string` to prevent `const` type incompatibility with Record<string, State>
exports.PLAYBOOK_FORMATTER_STEP_NAME = "PLAYBOOK_FORMATTER";
exports.PLAYBOOK_DIRECT_INVOCATION_CHECK_STEP_NAME = "Was_Playbook_Direct_Executed";
exports.PLAYBOOK_SETUP_STEP_NAME = "Setup_Socless_Global_State";
exports.SOCLESS_CORE_LAMBDA_NAME_FOR_RUNNING_PLAYBOOK_SETUP = "_socless_setup_global_state_for_direct_invoked_playbook";
exports.STATES_EXECUTION_ROLE_ARN = {
    "Fn::Sub": "arn:aws:iam::${AWS::AccountId}:role/socless-${{self:provider.stage}}-states-execution",
};
exports.AWS_EVENT_RULE_RESOURCE_TYPE = "AWS::Events::Rule";
exports.JSON_SCHEMA_ID_BASE_URI = "http://socless-apb-validator.socless";
exports.JSON_SCHEMA_VERSION = "http://json-schema.org/draft-07/schema#";
