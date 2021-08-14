/**
 * Schema definition and validation is implemented using the Joi library at https://joi.dev.
 * Prior to the Joi implementation, JSONSchema and ajv were used. The switch to Joi was made because
 * the Joi Schema implementation is more succinct, easier to reason about, easier to express/maintain, and better
 * documented when compared to JSONSchema implementation.
 */
import Joi from "joi";
export declare const StateNameRegex: RegExp;
export declare const APBRenderNontStringValue: Joi.StringSchema;
export declare const StateName: Joi.StringSchema;
export declare const PathExpression: Joi.StringSchema;
export declare const ISOTimestamp: Joi.StringSchema;
export declare const PassSchema: Joi.ObjectSchema<any>;
export declare const SucceedSchema: Joi.ObjectSchema<any>;
export declare const FailSchema: Joi.ObjectSchema<any>;
export declare const WaitSchema: Joi.ObjectSchema<any>;
export declare const ErrorEquals: Joi.ArraySchema;
export declare const Retrier: Joi.ObjectSchema<any>;
export declare const Retry: Joi.ArraySchema;
export declare const Catcher: Joi.ObjectSchema<any>;
export declare const Catch: Joi.ArraySchema;
export declare const TaskSchema: Joi.ObjectSchema<any>;
export declare const DecoratorTaskSchema: Joi.ObjectSchema<any>;
/**
 * Represents a Choice Rule Data-test Expression which is nested in
 * a ChoiceBooleanExpression.
 */
export declare const NestedDataTestExpression: Joi.ObjectSchema<any>;
export declare const ChoiceBooleanExpression: Joi.ObjectSchema<any>;
export declare const TopLevelDataTestExpression: Joi.ObjectSchema<any>;
export declare const ChoiceSchema: Joi.ObjectSchema<any>;
export declare const ParallelSchema: Joi.ObjectSchema<any>;
export declare const MapSchema: Joi.ObjectSchema<any>;
export declare const StateMachineSchema: Joi.ObjectSchema<any>;
export declare const DisableDefaultRetry: Joi.ObjectSchema<any>;
export declare const TaskFailureHandlerSchema: Joi.ObjectSchema<any>[];
export declare const DecoratorsSchema: Joi.ObjectSchema<any>;
export declare const PlaybookSchema: Joi.ObjectSchema<any>;
export declare const ValidateStateHelper: {
    Task: Joi.ObjectSchema<any>;
    Interaction: Joi.ObjectSchema<any>;
    Fail: Joi.ObjectSchema<any>;
    Pass: Joi.ObjectSchema<any>;
    Succeed: Joi.ObjectSchema<any>;
    Wait: Joi.ObjectSchema<any>;
    Choice: Joi.ObjectSchema<any>;
    Parallel: Joi.ObjectSchema<any>;
    Map: Joi.ObjectSchema<any>;
};
