export interface StepFunction {
  StartAt: string;
  States: Record<string, State | unknown>;
  Playbook?: string;
  Comment?: string;
}

// Customized from https://states-language.net/

// shared attributes for all END or CHOICE states (Succeed, Fail, Choice)
interface BaseStateTerminal {
  Type: string;
  Comment?: string;
}

// https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-succeed-state.html
export interface SucceedState extends BaseStateTerminal {
  Type: "Succeed";
  InputPath?: string;
  OutputPath?: string;
}

// https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-fail-state.html
export interface FailState extends BaseStateTerminal {
  Type: "Fail";
  Cause?: string; // Provides a custom failure string that can be used for operational or diagnostic purposes.
  Error?: string; // Provides an error name that can be used for operational or diagnostic purposes.
}

// https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-choice-state.html
export interface ChoiceState extends BaseStateTerminal {
  Type: "Choice";
  Choices: ChoiceRule[];
  Default?: string;
  InputPath?: string;
  OutputPath?: string;
}

// Shared attributes for all regular States (Wait, Pass) & (Task, Parallel, Map, Interaction)
// https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-common-fields.html
export interface CommonStateFields {
  Type: string;
  Comment?: string;
  InputPath?: string;
  OutputPath?: string;
  // Only one of the following -
  Next?: string;
  End?: boolean;
}

// https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-wait-state.html
export interface WaitState extends CommonStateFields {
  Type: "Wait";
  // Only one of the following -
  Seconds?: number;
  Timestamp?: string;
  SecondsPath?: string;
  TimestampPath?: string;
}

// https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-pass-state.html
export interface PassState extends CommonStateFields {
  Type: "Pass";
  Parameters?: Record<string, unknown>;
  Result?: Record<string, unknown>;
  ResultPath?: string;
}

// shared attributes for all States that do actions (Task, Parallel, Map, Interaction)
interface BaseStateAction extends CommonStateFields {
  Parameters?: Record<string, unknown>;
  ResultPath?: string;
  ResultSelector?: Record<string, unknown>;
  Retry?: unknown[];
  Catch?: unknown[];
}

// https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-task-state.html
export interface TaskState extends BaseStateAction {
  Type: "Task";
  Resource: string;
  TimeoutSeconds?: number;
  TimeoutSecondsPath?: string;
  HeartbeatSeconds?: number;
  HeartbeatSecondsPath?: string;
}

// https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-map-state.html
export interface MapState extends BaseStateAction {
  Type: "Map";
  Iterator: StepFunction;
  ItemsPath: string;
  MaxConcurrency: number;
}

// https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-parallel-state.html
interface ParallelState extends BaseStateAction {
  Type: "Parallel";
  Branches: StepFunction[];
}

// SOCless custom state
export interface InteractionState extends BaseStateAction {
  Type: "Interaction";
  Resource: string;
  TimeoutSeconds?: number;
  TimeoutSecondsPath?: string;
  HeartbeatSeconds?: number;
  HeartbeatSecondsPath?: string;
}

export declare type State =
  | TaskState
  | FailState
  | SucceedState
  | MapState
  | ChoiceState
  | ParallelState
  | PassState
  | InteractionState
  | WaitState;

// https://docs.aws.amazon.com/step-functions/latest/dg/amazon-states-language-choice-state.html#amazon-states-language-choice-state-rules
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

export {};
