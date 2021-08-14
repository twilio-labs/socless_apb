"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apb = void 0;
var constants_1 = require("./constants");
var errors_1 = require("./errors");
var validators_1 = require("./validators");
var apb = /** @class */ (function () {
    function apb(definition, apb_config) {
        var _a, _b;
        if (apb_config === void 0) { apb_config = {}; }
        var _c = validators_1.validatePlaybook(definition), isValid = _c.isValid, errors = _c.errors;
        if (!isValid) {
            throw new errors_1.PlaybookValidationError("Playbook Definition is invalid " + JSON.stringify(errors, null, 2));
        }
        this.apb_config = apb_config;
        this.DecoratorFlags = __assign({ hasTaskFailureHandler: false }, constants_1.DECORATOR_FLAGS);
        var Playbook = definition.Playbook, States = definition.States, Decorators = definition.Decorators, StartAt = definition.StartAt, Comment = definition.Comment, topLevel = __rest(definition, ["Playbook", "States", "Decorators", "StartAt", "Comment"]);
        this.Decorators = Decorators || {};
        this.PlaybookName = Playbook;
        this.States = States;
        // Check for TaskFailureHandler Decorator and modify this.States accordingly
        if (this.Decorators) {
            if (this.taskErrorHandlerExists()) {
                this.DecoratorFlags.hasTaskFailureHandler = true;
                Object.assign(this.States, this.genTaskFailureHandlerStates(this.Decorators.TaskFailureHandler));
            }
            else {
                this.DecoratorFlags.hasTaskFailureHandler = false;
            }
        }
        var startingStep = this.generate_playbook_setup_steps(StartAt);
        // build resolved state machine from socless states
        this.StateMachine = __assign(__assign({}, topLevel), { Comment: Comment, StartAt: constants_1.PLAYBOOK_DIRECT_INVOCATION_CHECK_STEP_NAME, States: __assign(__assign({}, startingStep), this.transformStates()) });
        // build finalized yaml output
        this.StateMachineYaml = {
            Resources: (_a = {},
                _a[this.PlaybookName] = {
                    Type: "AWS::StepFunctions::StateMachine",
                    Properties: __assign({ RoleArn: constants_1.STATES_EXECUTION_ROLE_ARN, StateMachineName: this.PlaybookName, DefinitionString: {
                            "Fn::Sub": JSON.stringify(this.StateMachine, null, 4).replace(constants_1.PARSE_SELF_PATTERN, "$2"),
                        } }, this.buildLoggingConfiguration()),
                },
                _a),
            Outputs: (_b = {},
                _b[this.PlaybookName] = {
                    Description: Comment,
                    Value: {
                        Ref: this.PlaybookName,
                    },
                },
                _b),
        };
    }
    //* BOOLEAN CHECKS & Validators /////////////////////////////////////////////////////
    apb.prototype.isDefaultRetryDisabled = function (stateName) {
        if (this.Decorators.DisableDefaultRetry) {
            var disable = this.Decorators.DisableDefaultRetry;
            return (disable.all || (disable.tasks && disable.tasks.includes(stateName)));
        }
        else {
            return false;
        }
    };
    apb.prototype.taskErrorHandlerExists = function () {
        return this.Decorators.TaskFailureHandler;
    };
    //* STATE GENERATIONS /////////////////////////////////////////////////////
    apb.prototype.genTaskFailureHandlerCatchConfig = function (stateName) {
        return {
            ErrorEquals: ["States.TaskFailed"],
            ResultPath: "$.errors." + stateName,
            Next: this.DecoratorFlags.TaskFailureHandlerStartLabel,
        };
    };
    apb.prototype.genTaskFailureHandlerStates = function (TaskFailureHandler) {
        var _a;
        delete TaskFailureHandler.End;
        TaskFailureHandler.Next = this.DecoratorFlags.TaskFailureHandlerEndLabel;
        return _a = {},
            _a[this.DecoratorFlags.TaskFailureHandlerStartLabel] = {
                Type: "Pass",
                Next: this.DecoratorFlags.TaskFailureHandlerName,
            },
            _a[this.DecoratorFlags.TaskFailureHandlerName] = TaskFailureHandler,
            _a[this.DecoratorFlags.TaskFailureHandlerEndLabel] = {
                Type: "Fail",
            },
            _a;
    };
    //* ATTRIBUTE TRANSFORMS /////////////////////////////////////////////////////
    apb.prototype.transformCatchConfig = function (catchConfig, States) {
        var catches = catchConfig.map(function (catchState) {
            return Object.assign({}, catchState, {
                Next: catchState.Next,
            });
        });
        return catches;
    };
    apb.prototype.transformRetryConfig = function (retryConfig, stateName) {
        var currentStepDefaultRetry = JSON.parse(JSON.stringify(constants_1.DEFAULT_RETRY)); // deepcopy
        var retries = retryConfig.map(function (retryState) {
            // remove this error type from the default retry
            currentStepDefaultRetry.ErrorEquals =
                currentStepDefaultRetry.ErrorEquals.filter(function (e) {
                    return !retryState.ErrorEquals.includes(e);
                });
            // add this retry to the final config
            return Object.assign({}, retryState);
        });
        // add any remaining default retries if enabled
        if (currentStepDefaultRetry.ErrorEquals.length >= 1 &&
            !this.isDefaultRetryDisabled(stateName)) {
            retries.push(currentStepDefaultRetry);
        }
        return retries;
    };
    //* STEP TRANSFORMS //////////////////////////////////////////////////
    apb.prototype.defaultTransformState = function (stateName, stateConfig, States) {
        var _a;
        var transformedConfig = Object.assign({}, stateConfig);
        if (!!stateConfig["Next"]) {
            transformedConfig = __assign(__assign({}, transformedConfig), { Next: stateConfig.Next });
        }
        return _a = {}, _a[stateName] = transformedConfig, _a;
    };
    apb.prototype.transformChoiceState = function (stateName, stateConfig, States) {
        var _a;
        if (States === void 0) { States = this.States; }
        var choices = [];
        stateConfig.Choices.forEach(function (choice) {
            choices.push(Object.assign({}, choice, {
                Next: choice.Next,
            }));
        });
        return _a = {},
            _a[stateName] = Object.assign({}, stateConfig, { Choices: choices }),
            _a;
    };
    apb.prototype.generateParametersForSoclessTask = function (state_name, handle_state_kwargs) {
        var parameters = {
            "execution_id.$": "$.execution_id",
            "artifacts.$": "$.artifacts",
            "errors.$": "$.errors",
            "results.$": "$.results",
            State_Config: {
                Name: state_name,
                Parameters: handle_state_kwargs,
            },
        };
        return parameters;
    };
    apb.prototype.generateParametersForSoclessInteraction = function (state_name, handle_state_kwargs, function_name) {
        var parameters = {
            FunctionName: function_name,
            Payload: {
                sfn_context: this.generateParametersForSoclessTask(state_name, handle_state_kwargs),
                "task_token.$": "$$.Task.Token",
            },
        };
        return parameters;
    };
    apb.prototype.transformTaskState = function (stateName, stateConfig, States, DecoratorFlags) {
        var _a;
        var output = {};
        var newConfig = Object.assign({}, stateConfig);
        if (!!newConfig["Next"]) {
            Object.assign(newConfig, {
                Next: newConfig.Next,
            });
        }
        if (!!newConfig["Catch"]) {
            Object.assign(newConfig, {
                Catch: this.transformCatchConfig(newConfig.Catch, States),
            });
        }
        if (!!newConfig["Retry"]) {
            Object.assign(newConfig, {
                Retry: this.transformRetryConfig(newConfig.Retry, stateName),
            });
        }
        else if (!this.isDefaultRetryDisabled(stateName)) {
            Object.assign(newConfig, { Retry: [constants_1.DEFAULT_RETRY] });
        }
        if (DecoratorFlags.hasTaskFailureHandler === true &&
            stateName !== this.DecoratorFlags.TaskFailureHandlerName) {
            var currentCatchConfig = newConfig.Catch || [];
            var handlerCatchConfig = [
                this.genTaskFailureHandlerCatchConfig(stateName),
            ];
            newConfig.Catch = __spreadArray(__spreadArray([], currentCatchConfig), handlerCatchConfig);
        }
        var handle_state_parameters = newConfig.Parameters;
        if (handle_state_parameters) {
            newConfig.Parameters = this.generateParametersForSoclessTask(stateName, handle_state_parameters);
        }
        Object.assign(output, (_a = {}, _a[stateName] = newConfig, _a));
        return output;
    };
    apb.prototype.transformInteractionState = function (stateName, stateConfig, States, DecoratorFlags) {
        var _a;
        var output = {};
        var newConfig = Object.assign({}, stateConfig);
        if (!!stateConfig["Next"]) {
            Object.assign(newConfig, {
                Next: stateConfig.Next,
            });
        }
        if (!!stateConfig["Catch"]) {
            Object.assign(newConfig, {
                Catch: this.transformCatchConfig(stateConfig.Catch, States),
            });
        }
        if (!!stateConfig["Retry"]) {
            Object.assign(newConfig, {
                Retry: this.transformRetryConfig(stateConfig.Retry, stateName),
            });
        }
        else if (!this.isDefaultRetryDisabled(stateName)) {
            Object.assign(newConfig, { Retry: [constants_1.DEFAULT_RETRY] });
        }
        if (DecoratorFlags.hasTaskFailureHandler === true &&
            stateName !== this.DecoratorFlags.TaskFailureHandlerName) {
            var currentCatchConfig = newConfig.Catch || [];
            var handlerCatchConfig = [
                this.genTaskFailureHandlerCatchConfig(stateName),
            ];
            newConfig.Catch = __spreadArray(__spreadArray([], currentCatchConfig), handlerCatchConfig);
        }
        newConfig.Parameters = this.generateParametersForSoclessInteraction(stateName, newConfig.Parameters, newConfig.Resource);
        newConfig.Resource = "arn:aws:states:::lambda:invoke.waitForTaskToken";
        newConfig.Type = "Task";
        Object.assign(output, (_a = {}, _a[stateName] = newConfig, _a));
        return output;
    };
    apb.prototype.transformParallelState = function (stateName, stateConfig, States, DecoratorFlags) {
        var _a;
        var _this = this;
        var Output = {};
        var Branches = stateConfig.Branches, End = stateConfig.End, topLevel = __rest(stateConfig, ["Branches", "End"]);
        var helperStateName = ("merge_" + stateName.toLowerCase()).slice(0, 128);
        var helperState = {
            Type: "Task",
            Resource: "${{self:custom.core.MergeParallelOutput}}",
            Catch: [],
        };
        if (DecoratorFlags.hasTaskFailureHandler === true &&
            stateName !== this.DecoratorFlags.TaskFailureHandlerName) {
            // add catch for top level
            var currentCatchConfig = topLevel.Catch || [];
            var handlerCatchConfig = [
                this.genTaskFailureHandlerCatchConfig(stateName),
            ];
            topLevel.Catch = __spreadArray(__spreadArray([], currentCatchConfig), handlerCatchConfig);
            // add catch and retries for merge output task
            helperState.Catch = [
                this.genTaskFailureHandlerCatchConfig(helperStateName),
            ];
        }
        if (!this.isDefaultRetryDisabled(stateName)) {
            Object.assign(helperState, { Retry: [constants_1.DEFAULT_RETRY] });
        }
        if (End === undefined) {
            Object.assign(helperState, {
                Next: stateConfig.Next,
            });
        }
        else {
            Object.assign(helperState, { End: true });
        }
        Object.assign(Output, topLevel, { Next: helperStateName });
        var newBranches = Branches.map(function (branch) {
            return {
                StartAt: branch.StartAt,
                States: _this.transformStates((States = branch.States), (DecoratorFlags = {})),
            };
        });
        Object.assign(Output, { Branches: newBranches });
        return _a = {},
            _a[stateName] = Output,
            _a[helperStateName] = helperState,
            _a;
    };
    apb.prototype.transformStates = function (States, DecoratorFlags) {
        var _this = this;
        if (States === void 0) { States = this.States; }
        if (DecoratorFlags === void 0) { DecoratorFlags = this.DecoratorFlags; }
        var output = {};
        Object.entries(States).forEach(function (_a) {
            var stateName = _a[0], stateConfig = _a[1];
            switch (stateConfig.Type) {
                case "Choice":
                    Object.assign(output, _this.transformChoiceState(stateName, stateConfig, States));
                    break;
                case "Task":
                    Object.assign(output, _this.transformTaskState(stateName, stateConfig, States, DecoratorFlags));
                    break;
                case "Interaction":
                    Object.assign(output, _this.transformInteractionState(stateName, stateConfig, States, DecoratorFlags));
                    break;
                case "Parallel":
                    Object.assign(output, _this.transformParallelState(stateName, stateConfig, States, DecoratorFlags));
                    break;
                case "Pass":
                case "Wait":
                case "Succeed":
                case "Fail":
                    Object.assign(output, _this.defaultTransformState(stateName, stateConfig, States));
                    break;
                default:
                    console.log("Unknown Type: " + stateConfig.Type);
                    break;
            }
        });
        return output;
    };
    apb.prototype.buildLoggingConfiguration = function () {
        var logs_enabled = {
            LoggingConfiguration: {
                Destinations: [
                    {
                        CloudWatchLogsLogGroup: {
                            LogGroupArn: "${{cf:socless-${{self:provider.stage}}.PlaybooksLogGroup}}",
                        },
                    },
                ],
                IncludeExecutionData: false,
                Level: "ALL",
            },
        };
        var logs_disabled = {};
        return this.apb_config.logging ? logs_enabled : logs_disabled;
    };
    apb.prototype.generatePlaybookFormatterStep = function (startAtStepName) {
        var _a;
        var initial_step = (_a = {},
            _a[constants_1.PLAYBOOK_FORMATTER_STEP_NAME] = {
                Type: "Pass",
                Parameters: {
                    "execution_id.$": "$.execution_id",
                    "artifacts.$": "$.artifacts",
                    results: {},
                    errors: {},
                },
                Next: startAtStepName,
            },
            _a);
        return initial_step;
    };
    apb.prototype.generate_playbook_setup_steps = function (startAtStepName) {
        var _a, _b;
        // Choice state checks if `artifacts` and `execution_id` exist in playbook input.
        // if yes, continue to regular playbook steps
        // if no, run lambda that sets up SOCless global state for this playbook, then continue to regular playbook
        var check_if_playbook_was_direct_executed = (_a = {},
            _a[constants_1.PLAYBOOK_DIRECT_INVOCATION_CHECK_STEP_NAME] = {
                Type: "Choice",
                Choices: [
                    {
                        And: [
                            {
                                Variable: "$.artifacts",
                                IsPresent: true,
                            },
                            {
                                Variable: "$.execution_id",
                                IsPresent: true,
                            },
                            {
                                Variable: "$.errors",
                                IsPresent: false,
                            },
                            {
                                Variable: "$.results",
                                IsPresent: false,
                            },
                        ],
                        Next: constants_1.PLAYBOOK_FORMATTER_STEP_NAME,
                    },
                    {
                        And: [
                            {
                                Variable: "$.artifacts",
                                IsPresent: true,
                            },
                            {
                                Variable: "$.execution_id",
                                IsPresent: true,
                            },
                            {
                                Variable: "$.errors",
                                IsPresent: true,
                            },
                            {
                                Variable: "$.results",
                                IsPresent: true,
                            },
                        ],
                        Next: startAtStepName,
                    },
                ],
                Default: constants_1.PLAYBOOK_SETUP_STEP_NAME,
            },
            _a);
        var PLAYBOOK_SETUP_STEP = (_b = {},
            _b[constants_1.PLAYBOOK_SETUP_STEP_NAME] = {
                Type: "Task",
                Resource: "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:" +
                    constants_1.SOCLESS_CORE_LAMBDA_NAME_FOR_RUNNING_PLAYBOOK_SETUP,
                Parameters: {
                    "execution_id.$": "$$.Execution.Name",
                    "playbook_name.$": "$$.StateMachine.Name",
                    "playbook_event_details.$": "$$.Execution.Input",
                },
                Next: startAtStepName,
            },
            _b);
        var setup_steps = __assign(__assign(__assign({}, check_if_playbook_was_direct_executed), PLAYBOOK_SETUP_STEP), this.generatePlaybookFormatterStep(startAtStepName));
        return setup_steps;
    };
    return apb;
}());
exports.apb = apb;
