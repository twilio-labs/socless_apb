export declare const PARSE_SELF_NAME = "apb_render_nonstring_value";
export declare const PARSE_SELF_REGEX_STRING: string;
export declare const PARSE_SELF_PATTERN: RegExp;
export declare const DEFAULT_RETRY: Readonly<{
    ErrorEquals: string[];
    IntervalSeconds: number;
    MaxAttempts: number;
    BackoffRate: number;
}>;
export declare const DECORATOR_FLAGS: Readonly<{
    TaskFailureHandlerName: string;
    TaskFailureHandlerStartLabel: string;
    TaskFailureHandlerEndLabel: string;
}>;
export declare const PLAYBOOK_FORMATTER_STEP_NAME: string;
export declare const PLAYBOOK_DIRECT_INVOCATION_CHECK_STEP_NAME: string;
export declare const PLAYBOOK_SETUP_STEP_NAME: string;
export declare const SOCLESS_CORE_LAMBDA_NAME_FOR_RUNNING_PLAYBOOK_SETUP = "_socless_setup_global_state_for_direct_invoked_playbook";
export declare const STATES_EXECUTION_ROLE_ARN: {
    "Fn::Sub": string;
};
export declare const AWS_EVENT_RULE_RESOURCE_TYPE = "AWS::Events::Rule";
export declare const JSON_SCHEMA_ID_BASE_URI = "http://socless-apb-validator.socless";
export declare const JSON_SCHEMA_VERSION = "http://json-schema.org/draft-07/schema#";
