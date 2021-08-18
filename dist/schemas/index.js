"use strict";
/**
 * Schema definition and validation is implemented using the Joi library at https://joi.dev.
 * Prior to the Joi implementation, JSONSchema and ajv were used. The switch to Joi was made because
 * the Joi Schema implementation is more succinct, easier to reason about, easier to express/maintain, and better
 * documented when compared to JSONSchema implementation.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateStateHelper = exports.PlaybookSchema = exports.DecoratorsSchema = exports.TaskFailureHandlerSchema = exports.DisableDefaultRetry = exports.StateMachineSchema = exports.MapSchema = exports.ParallelSchema = exports.ChoiceSchema = exports.TopLevelDataTestExpression = exports.ChoiceBooleanExpression = exports.NestedDataTestExpression = exports.DecoratorTaskSchema = exports.TaskSchema = exports.Catch = exports.Catcher = exports.Retry = exports.Retrier = exports.ErrorEquals = exports.WaitSchema = exports.FailSchema = exports.SucceedSchema = exports.PassSchema = exports.ISOTimestamp = exports.PathExpression = exports.StateName = exports.APBRenderNontStringValue = exports.StateNameRegex = void 0;
var joi_1 = __importDefault(require("joi"));
exports.StateNameRegex = /^[a-zA-Z0-9_]{1,}/;
exports.APBRenderNontStringValue = joi_1.default.string().pattern(
// This pattern is manually repeated here for now as the
// version in the constants file seems to fail with Joi
// even though it works in str.replace
// I suspect it might have something to do with the capture groups
// Todo: Revist this to succesfully centralize and re-use a single regex for this
new RegExp("^apb_render_nonstring_value\\(.+\\)$"));
exports.StateName = joi_1.default.string().pattern(exports.StateNameRegex);
exports.PathExpression = joi_1.default.string().pattern(/^\$.*$/);
exports.ISOTimestamp = joi_1.default.string().isoDate();
var Base = joi_1.default.object({
    Next: exports.StateName,
    End: true,
    Comment: joi_1.default.string(),
}).xor("Next", "End");
var IOState = Base.append({
    InputPath: exports.PathExpression,
    OutputPath: exports.PathExpression,
});
//done
exports.PassSchema = IOState.append({
    Type: joi_1.default.string().required().valid("Pass"),
    ResultPath: exports.PathExpression,
    Result: joi_1.default.object().unknown(true),
    Parameters: joi_1.default.object().unknown(true),
});
//done
exports.SucceedSchema = joi_1.default.object({
    Type: joi_1.default.string().required().valid("Succeed"),
    Comment: joi_1.default.string(),
    InputPath: exports.PathExpression,
    OutputPath: exports.PathExpression,
});
//done
exports.FailSchema = joi_1.default.object({
    Type: joi_1.default.string().required().valid("Fail"),
    Comment: joi_1.default.string(),
    Cause: joi_1.default.string(),
    Error: joi_1.default.string(),
});
// done
exports.WaitSchema = IOState.append({
    Type: joi_1.default.string().required().valid("Wait"),
    Seconds: [joi_1.default.number().min(0), exports.APBRenderNontStringValue],
    Timestamp: exports.ISOTimestamp,
    SecondsPath: exports.PathExpression,
    TimestampPath: exports.PathExpression,
}).xor("Seconds", "Timestamp", "SecondsPath", "TimestampPath");
exports.ErrorEquals = joi_1.default.array()
    .items(joi_1.default.string().required())
    .required();
// done
exports.Retrier = joi_1.default.object({
    ErrorEquals: exports.ErrorEquals,
    IntervalSeconds: joi_1.default.number().integer().min(1).max(99999999),
    MaxAttempts: joi_1.default.number().integer().min(0).max(99999999),
    BackoffRate: joi_1.default.number().min(0),
});
exports.Retry = joi_1.default.array().items(exports.Retrier.required());
// done
exports.Catcher = joi_1.default.object({
    ErrorEquals: exports.ErrorEquals,
    Next: exports.StateName.required(),
    ResultPath: exports.PathExpression,
});
exports.Catch = joi_1.default.array().items(exports.Catcher.required());
var TaskCommons = {
    Type: joi_1.default.string().required().valid("Task", "Interaction"),
    Resource: joi_1.default.string().required(),
    Parameters: joi_1.default.object().unknown(true),
    ResultPath: exports.PathExpression,
    ResultSelector: joi_1.default.object().unknown(true),
    TimeoutSeconds: joi_1.default.number().integer().min(1).max(99999999),
    TimeoutSecondsPath: exports.PathExpression,
    HeartbeatSeconds: joi_1.default.number().integer().min(1).max(99999999),
    HeartbeatSecondsPath: exports.PathExpression,
    Retry: exports.Retry,
    Catch: exports.Catch,
};
// done
exports.TaskSchema = IOState.append(TaskCommons);
exports.DecoratorTaskSchema = joi_1.default.object({
    InputPath: exports.PathExpression,
    OutputPath: exports.PathExpression,
    Next: exports.StateName,
    End: true,
})
    .append(TaskCommons)
    .oxor("Next", "End");
/**
 * Represents a Choice Rule Data-test Expression which is nested in
 * a ChoiceBooleanExpression.
 */
exports.NestedDataTestExpression = joi_1.default.object({
    Variable: joi_1.default.string().required(),
    StringEquals: joi_1.default.string(),
    StringEqualsPath: exports.PathExpression,
    StringLessThan: joi_1.default.string(),
    StringLessThanPath: exports.PathExpression,
    StringGreaterThan: joi_1.default.string(),
    StringGreaterThanPath: exports.PathExpression,
    StringLessThanEquals: joi_1.default.string(),
    StringLessThanEqualsPath: exports.PathExpression,
    StringMatches: joi_1.default.string(),
    NumericEquals: joi_1.default.number(),
    NumericEqualsPath: exports.PathExpression,
    NumericLessThan: joi_1.default.number(),
    NumericLessThanPath: exports.PathExpression,
    NumericGreaterThan: joi_1.default.number(),
    NumericGreaterThanPath: exports.PathExpression,
    NumericLessThanEquals: joi_1.default.number(),
    NumericLessThanEqualsPath: exports.PathExpression,
    NumericGreaterThanEquals: joi_1.default.number(),
    NumericGreaterThanEqualsPath: exports.PathExpression,
    BooleanEquals: joi_1.default.boolean(),
    BooleanEqualsPath: exports.PathExpression,
    TimestampEquals: exports.ISOTimestamp,
    TimestampEqualsPath: exports.PathExpression,
    TimestampLessThan: exports.ISOTimestamp,
    TimestampLessThanPath: exports.PathExpression,
    TimestampGreaterThan: exports.ISOTimestamp,
    TimestampGreaterThanPath: exports.PathExpression,
    TimestampLessThanEquals: exports.ISOTimestamp,
    TimestampLessThanEqualsPath: exports.PathExpression,
    TimestampGreaterThanEquals: exports.ISOTimestamp,
    TimestampGreaterThanEqualsPath: exports.PathExpression,
    IsNull: joi_1.default.boolean().valid(true),
    IsPresent: joi_1.default.boolean().valid(true),
    IsNumeric: joi_1.default.boolean().valid(true),
    IsString: joi_1.default.boolean().valid(true),
    IsTimestamp: joi_1.default.boolean().valid(true),
}).xor("StringEquals", "StringEqualsPath", "StringLessThan", "StringLessThanPath", "StringGreaterThan", "StringGreaterThanPath", "StringLessThanEquals", "StringLessThanEqualsPath", "StringMatches", "NumericEquals", "NumericEqualsPath", "NumericLessThan", "NumericLessThanPath", "NumericGreaterThan", "NumericGreaterThanPath", "NumericLessThanEquals", "NumericLessThanEqualsPath", "NumericGreaterThanEquals", "NumericGreaterThanEqualsPath", "BooleanEquals", "BooleanEqualsPath", "TimestampEquals", "TimestampEqualsPath", "TimestampLessThan", "TimestampLessThanPath", "TimestampGreaterThan", "TimestampGreaterThanPath", "TimestampLessThanEquals", "TimestampLessThanEqualsPath", "TimestampGreaterThanEquals", "TimestampGreaterThanEqualsPath", "IsNull", "IsPresent", "IsNumeric", "IsString", "IsTimestamp");
// done
exports.ChoiceBooleanExpression = joi_1.default.object({
    Next: exports.StateName.required(),
    Not: exports.NestedDataTestExpression,
    And: joi_1.default.array().items(exports.NestedDataTestExpression.required()),
    Or: joi_1.default.array().items(exports.NestedDataTestExpression.required()),
}).xor("And", "Not", "Or");
// done
exports.TopLevelDataTestExpression = exports.NestedDataTestExpression.append({
    Next: exports.StateName.required(),
});
exports.ChoiceSchema = joi_1.default.object({
    Type: joi_1.default.string().required().valid("Choice"),
    Comment: joi_1.default.string(),
    InputPath: exports.PathExpression,
    OutputPath: exports.PathExpression,
    Default: exports.StateName,
    Choices: joi_1.default.array()
        .items(exports.ChoiceBooleanExpression, exports.TopLevelDataTestExpression)
        .min(1)
        .required(),
});
exports.ParallelSchema = IOState.append({
    Type: joi_1.default.string().required().valid("Parallel"),
    ResultPath: joi_1.default.string(),
    Parameters: joi_1.default.object().unknown(true),
    ResultSelector: joi_1.default.object().unknown(true),
    Retry: exports.Retry,
    Catch: exports.Catch,
    Branches: joi_1.default.array()
        .items(joi_1.default.link("#StateMachineSchema").required())
        .required(),
}).id("ParallelSchema");
exports.MapSchema = IOState.append({
    Type: joi_1.default.string().required().valid("Map"),
    Iterator: joi_1.default.link("#StateMachineSchema").required(),
    ItemsPath: exports.PathExpression,
    MaxConcurrency: joi_1.default.number().integer().min(0),
    ResultPath: exports.PathExpression,
    Parameters: joi_1.default.object().unknown(true),
    ResultSelector: joi_1.default.object().unknown(true),
    Retry: exports.Retry,
    Catch: exports.Catch,
}).id("MapSchema");
exports.StateMachineSchema = joi_1.default.object({
    Comment: joi_1.default.string(),
    StartAt: exports.StateName.required(),
    States: joi_1.default.object().pattern(exports.StateNameRegex, [
        exports.FailSchema,
        exports.SucceedSchema,
        exports.PassSchema,
        exports.WaitSchema,
        exports.TaskSchema,
        exports.ChoiceSchema,
        joi_1.default.link("#ParallelSchema"),
        joi_1.default.link("#MapSchema"),
    ]),
    Version: joi_1.default.string(),
    TimeoutSeconds: joi_1.default.number().integer().min(0),
})
    .id("StateMachineSchema")
    .shared(exports.ParallelSchema)
    .shared(exports.MapSchema);
exports.DisableDefaultRetry = joi_1.default.object({
    all: joi_1.default.boolean(),
    tasks: joi_1.default.array().items(exports.StateName.required()),
}).xor("all", "tasks");
exports.TaskFailureHandlerSchema = [exports.DecoratorTaskSchema, exports.ParallelSchema];
exports.DecoratorsSchema = joi_1.default.object({
    TaskFailureHandler: exports.TaskFailureHandlerSchema,
    DisableDefaultRetry: exports.DisableDefaultRetry,
});
exports.PlaybookSchema = exports.StateMachineSchema.append({
    Playbook: joi_1.default.string().alphanum().required(),
    Decorators: exports.DecoratorsSchema,
})
    .id("PlaybookSchema")
    .shared(exports.StateMachineSchema);
exports.ValidateStateHelper = {
    Task: exports.TaskSchema,
    Interaction: exports.TaskSchema,
    Fail: exports.FailSchema,
    Pass: exports.PassSchema,
    Succeed: exports.SucceedSchema,
    Wait: exports.WaitSchema,
    Choice: exports.ChoiceSchema,
    // Add StateMachineSchema to the scope of Parallel and Map Schemas
    // Since these schemas depend on StateMachineSchema
    Parallel: exports.ParallelSchema.shared(exports.StateMachineSchema),
    Map: exports.MapSchema.shared(exports.StateMachineSchema),
};
