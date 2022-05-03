/**
 * Schema definition and validation is implemented using the Joi library at https://joi.dev.
 * Prior to the Joi implementation, JSONSchema and ajv were used. The switch to Joi was made because
 * the Joi Schema implementation is more succinct, easier to reason about, easier to express/maintain, and better
 * documented when compared to JSONSchema implementation.
 */

import Joi from "joi";
import { PARSE_SELF_NAME } from "../constants";

export const StateNameRegex = /^[a-zA-Z0-9_]{1,}/;

export const APBRenderNontStringValue = Joi.string().pattern(
  // This pattern is manually repeated here for now as the
  // version in the constants file seems to fail with Joi
  // even though it works in str.replace
  // I suspect it might have something to do with the capture groups
  // Todo: Revist this to succesfully centralize and re-use a single regex for this
  new RegExp(`^${PARSE_SELF_NAME}\\(.+\\)$`)
);

export const StateName = Joi.string().pattern(StateNameRegex);
export const PathExpression = Joi.string().pattern(/^\$.*$/);
export const ISOTimestamp = Joi.string().isoDate();

const Base = Joi.object({
  Next: StateName,
  End: true,
  Comment: Joi.string(),
}).xor("Next", "End");

const IOState = Base.append({
  InputPath: PathExpression,
  OutputPath: PathExpression,
});

//done
export const PassSchema = IOState.append({
  Type: Joi.string().required().valid("Pass"),
  ResultPath: PathExpression,
  Result: Joi.object().unknown(true),
  Parameters: Joi.object().unknown(true),
});

//done
export const SucceedSchema = Joi.object({
  Type: Joi.string().required().valid("Succeed"),
  Comment: Joi.string(),
  InputPath: PathExpression,
  OutputPath: PathExpression,
});

//done
export const FailSchema = Joi.object({
  Type: Joi.string().required().valid("Fail"),
  Comment: Joi.string(),
  Cause: Joi.string(),
  Error: Joi.string(),
});

// done
export const WaitSchema = IOState.append({
  Type: Joi.string().required().valid("Wait"),
  Seconds: [Joi.number().min(0), APBRenderNontStringValue],
  Timestamp: ISOTimestamp,
  SecondsPath: PathExpression,
  TimestampPath: PathExpression,
}).xor("Seconds", "Timestamp", "SecondsPath", "TimestampPath");

export const ErrorEquals = Joi.array().items(Joi.string().required()).required();

// done
export const Retrier = Joi.object({
  ErrorEquals: ErrorEquals,
  IntervalSeconds: Joi.number().integer().min(1).max(99999999),
  MaxAttempts: Joi.number().integer().min(0).max(99999999),
  BackoffRate: Joi.number().min(0),
});

export const Retry = Joi.array().items(Retrier.required());

// done
export const Catcher = Joi.object({
  ErrorEquals: ErrorEquals,
  Next: StateName.required(),
  ResultPath: PathExpression,
});

export const Catch = Joi.array().items(Catcher.required());

const TaskCommons = {
  Type: Joi.string().required().valid("Task", "Interaction"),
  Resource: Joi.string().required(),
  Parameters: Joi.object().unknown(true),
  ResultPath: PathExpression,
  ResultSelector: Joi.object().unknown(true),
  TimeoutSeconds: Joi.number().integer().min(1).max(99999999),
  TimeoutSecondsPath: PathExpression,
  HeartbeatSeconds: Joi.number().integer().min(1).max(99999999),
  HeartbeatSecondsPath: PathExpression,
  Retry: Retry,
  Catch: Catch,
};

// done
export const TaskSchema = IOState.append(TaskCommons);

export const DecoratorTaskSchema = Joi.object({
  InputPath: PathExpression,
  OutputPath: PathExpression,
  Next: StateName,
  End: true,
})
  .append(TaskCommons)
  .oxor("Next", "End");

/**
 * Represents a Choice Rule Data-test Expression which is nested in
 * a ChoiceBooleanExpression.
 */
export const NestedDataTestExpression = Joi.object({
  Variable: Joi.string().required(),
  StringEquals: Joi.string(),
  StringEqualsPath: PathExpression,
  StringLessThan: Joi.string(),
  StringLessThanPath: PathExpression,
  StringGreaterThan: Joi.string(),
  StringGreaterThanPath: PathExpression,
  StringLessThanEquals: Joi.string(),
  StringLessThanEqualsPath: PathExpression,
  StringGreaterThanEquals: Joi.string(),
  StringGreaterThanEqualsPath: PathExpression,
  StringMatches: Joi.string(),
  NumericEquals: Joi.number(),
  NumericEqualsPath: PathExpression,
  NumericLessThan: Joi.number(),
  NumericLessThanPath: PathExpression,
  NumericGreaterThan: Joi.number(),
  NumericGreaterThanPath: PathExpression,
  NumericLessThanEquals: Joi.number(),
  NumericLessThanEqualsPath: PathExpression,
  NumericGreaterThanEquals: Joi.number(),
  NumericGreaterThanEqualsPath: PathExpression,
  BooleanEquals: Joi.boolean(),
  BooleanEqualsPath: PathExpression,
  TimestampEquals: ISOTimestamp,
  TimestampEqualsPath: PathExpression,
  TimestampLessThan: ISOTimestamp,
  TimestampLessThanPath: PathExpression,
  TimestampGreaterThan: ISOTimestamp,
  TimestampGreaterThanPath: PathExpression,
  TimestampLessThanEquals: ISOTimestamp,
  TimestampLessThanEqualsPath: PathExpression,
  TimestampGreaterThanEquals: ISOTimestamp,
  TimestampGreaterThanEqualsPath: PathExpression,
  IsBoolean: Joi.boolean(),
  IsNull: Joi.boolean(),
  IsPresent: Joi.boolean(),
  IsNumeric: Joi.boolean(),
  IsString: Joi.boolean(),
  IsTimestamp: Joi.boolean(),
}).xor(
  "StringEquals",
  "StringEqualsPath",
  "StringLessThan",
  "StringLessThanPath",
  "StringGreaterThan",
  "StringGreaterThanPath",
  "StringLessThanEquals",
  "StringLessThanEqualsPath",
  "StringGreaterThanEquals",
  "StringGreaterThanEqualsPath",
  "StringMatches",
  "NumericEquals",
  "NumericEqualsPath",
  "NumericLessThan",
  "NumericLessThanPath",
  "NumericGreaterThan",
  "NumericGreaterThanPath",
  "NumericLessThanEquals",
  "NumericLessThanEqualsPath",
  "NumericGreaterThanEquals",
  "NumericGreaterThanEqualsPath",
  "BooleanEquals",
  "BooleanEqualsPath",
  "TimestampEquals",
  "TimestampEqualsPath",
  "TimestampLessThan",
  "TimestampLessThanPath",
  "TimestampGreaterThan",
  "TimestampGreaterThanPath",
  "TimestampLessThanEquals",
  "TimestampLessThanEqualsPath",
  "TimestampGreaterThanEquals",
  "TimestampGreaterThanEqualsPath",
  "IsBoolean",
  "IsNull",
  "IsPresent",
  "IsNumeric",
  "IsString",
  "IsTimestamp"
);

/**
 * Represents a Not rule that is Nested in a ChoiceBooleanExpression
 */

export const NestedNotExpression = Joi.object({
  Not: NestedDataTestExpression,
});

// done
export const ChoiceBooleanExpression = Joi.object({
  Next: StateName.required(),
  Not: NestedDataTestExpression,
  And: Joi.array().items(NestedDataTestExpression, NestedNotExpression).min(1),
  Or: Joi.array().items(NestedDataTestExpression, NestedNotExpression).min(1),
}).xor("And", "Not", "Or");

// done
export const TopLevelDataTestExpression = NestedDataTestExpression.append({
  Next: StateName.required(),
});

export const ChoiceSchema = Joi.object({
  Type: Joi.string().required().valid("Choice"),
  Comment: Joi.string(),
  InputPath: PathExpression,
  OutputPath: PathExpression,
  Default: StateName,
  Choices: Joi.array().items(ChoiceBooleanExpression, TopLevelDataTestExpression).min(1).required(),
});

export const ParallelSchema = IOState.append({
  Type: Joi.string().required().valid("Parallel"),
  ResultPath: Joi.string(),
  Parameters: Joi.object().unknown(true),
  ResultSelector: Joi.object().unknown(true),
  Retry: Retry,
  Catch: Catch,
  Branches: Joi.array().items(Joi.link("#StateMachineSchema").required()).required(),
}).id("ParallelSchema");

export const MapSchema = IOState.append({
  Type: Joi.string().required().valid("Map"),
  Iterator: Joi.link("#StateMachineSchema").required(),
  ItemsPath: PathExpression,
  MaxConcurrency: Joi.number().integer().min(0),
  ResultPath: PathExpression,
  Parameters: Joi.object().unknown(true),
  ResultSelector: Joi.object().unknown(true),
  Retry: Retry,
  Catch: Catch,
}).id("MapSchema");

export const StateMachineSchema = Joi.object({
  Comment: Joi.string(),
  StartAt: StateName.required(),
  States: Joi.object().pattern(StateNameRegex, [
    FailSchema,
    SucceedSchema,
    PassSchema,
    WaitSchema,
    TaskSchema,
    ChoiceSchema,
    Joi.link("#ParallelSchema"),
    Joi.link("#MapSchema"),
  ]),
  Version: Joi.string(),
  TimeoutSeconds: Joi.number().integer().min(0),
})
  .id("StateMachineSchema")
  .shared(ParallelSchema)
  .shared(MapSchema);

export const DisableDefaultRetry = Joi.object({
  all: Joi.boolean(),
  tasks: Joi.array().items(StateName.required()),
}).xor("all", "tasks");

export const TaskFailureHandlerSchema = [DecoratorTaskSchema, ParallelSchema];

export const DecoratorsSchema = Joi.object({
  TaskFailureHandler: TaskFailureHandlerSchema,
  DisableDefaultRetry: DisableDefaultRetry,
});

export const PlaybookSchema = StateMachineSchema.append({
  Playbook: Joi.string().alphanum().required(),
  Decorators: DecoratorsSchema,
})
  .id("PlaybookSchema")
  .shared(StateMachineSchema);

export const ValidateStateHelper = {
  Task: TaskSchema,
  Interaction: TaskSchema,
  Fail: FailSchema,
  Pass: PassSchema,
  Succeed: SucceedSchema,
  Wait: WaitSchema,
  Choice: ChoiceSchema,
  // Add StateMachineSchema to the scope of Parallel and Map Schemas
  // Since these schemas depend on StateMachineSchema
  Parallel: ParallelSchema.shared(StateMachineSchema),
  Map: MapSchema.shared(StateMachineSchema),
};
