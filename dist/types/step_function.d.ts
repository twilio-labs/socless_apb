import { State } from ".";
export interface BaseStateTerminal {
    Type: string;
    Comment?: string;
}
export interface SucceedState extends BaseStateTerminal {
    Type: "Succeed";
    InputPath?: string;
    OutputPath?: string;
}
export interface FailState extends BaseStateTerminal {
    Type: "Fail";
    Cause?: string;
    Error?: string;
}
export interface ChoiceState extends BaseStateTerminal {
    Type: "Choice";
    Choices: ChoiceRule[];
    Default?: string;
    InputPath?: string;
    OutputPath?: string;
}
export interface CommonStateFields {
    Type: string;
    Comment?: string;
    InputPath?: string;
    OutputPath?: string;
    Next?: string;
    End?: boolean;
}
export interface WaitState extends CommonStateFields {
    Type: "Wait";
    Seconds?: number;
    Timestamp?: string;
    SecondsPath?: string;
    TimestampPath?: string;
}
export interface PassState extends CommonStateFields {
    Type: "Pass";
    Parameters?: Record<string, unknown>;
    Result?: Record<string, unknown>;
    ResultPath?: string;
}
export interface BaseStateAction extends CommonStateFields {
    Parameters?: Record<string, unknown>;
    ResultPath?: string;
    ResultSelector?: Record<string, unknown>;
    Retry?: unknown[];
    Catch?: unknown[];
}
export interface TaskState extends BaseStateAction {
    Type: "Task";
    Resource: string;
    TimeoutSeconds?: number;
    TimeoutSecondsPath?: string;
    HeartbeatSeconds?: number;
    HeartbeatSecondsPath?: string;
}
export interface MapState extends BaseStateAction {
    Type: "Map";
    Iterator: StepFunction;
    ItemsPath: string;
    MaxConcurrency: number;
}
export interface ParallelState extends BaseStateAction {
    Type: "Parallel";
    Branches: StepFunction[];
}
export interface ChoiceRule {
    Variable: string;
    Next?: string;
    And?: ChoiceRule[];
    Not?: ChoiceRule[];
    Or?: ChoiceRule[];
    StringEquals?: string;
    StringEqualsPath?: string;
    StringLessThan?: string;
    StringLessThanPath?: string;
    StringGreaterThan?: string;
    StringGreaterThanPath?: string;
    StringLessThanEquals?: string;
    StringLessThanEqualsPath?: string;
    StringGreaterThanEquals?: string;
    StringGreaterThanEqualsPath?: string;
    StringMatches?: string;
    NumericEquals?: number;
    NumericEqualsPath?: string;
    NumericLessThan?: number;
    NumericLessThanPath?: string;
    NumericGreaterThan?: number;
    NumericGreaterThanPath?: string;
    NumericLessThanEquals?: number;
    NumericLessThanEqualsPath?: string;
    NumericGreaterThanEquals?: number;
    NumericGreaterThanEqualsPath?: string;
    BooleanEquals?: boolean;
    BooleanEqualsPath?: string;
    TimestampEquals?: string;
    TimestampEqualsPath?: string;
    TimestampLessThan?: string;
    TimestampLessThanPath?: string;
    TimestampGreaterThan?: string;
    TimestampGreaterThanPath?: string;
    TimestampLessThanEquals?: string;
    TimestampLessThanEqualsPath?: string;
    TimestampGreaterThanEquals?: string;
    TimestampGreaterThanEqualsPath?: string;
    IsBoolean?: boolean;
    IsNull?: boolean;
    IsPresent?: boolean;
    IsNumeric?: boolean;
    IsString?: boolean;
    IsTimestamp?: boolean;
}
export interface StepFunction {
    StartAt: string;
    States: Record<string, State>;
    Comment?: string;
    TimeoutSeconds?: number;
    Version?: string;
}
export interface CloudFormationStateMachine {
    Type: "AWS::StepFunctions::StateMachine";
    Properties: CloudFormationStateMachineProperties;
}
export interface CloudFormationStateMachineProperties {
    RoleArn: string;
    Definition?: StepFunction;
    DefinitionS3Location?: unknown;
    DefinitionString?: string;
    DefinitionSubstitutions?: Record<string, string>;
    LoggingConfiguration?: unknown;
    StateMachineName?: string;
    StateMachineType?: "Standard" | "Express";
    Tags?: string[];
    TracingConfiguration?: {
        Enabled: boolean;
    };
}
export {};
