"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePlaybookHasUniqueStateNames = exports.validatePlaybookObjectSchema = exports.validatePlaybook = exports.validateState = exports.ValidationErrorTypes = void 0;
var schemas_1 = require("./schemas");
var ValidationErrorTypes;
(function (ValidationErrorTypes) {
    ValidationErrorTypes["SCHEMA_VALIDATION_ERROR"] = "SCHEMA_VALIDATION_ERROR";
    ValidationErrorTypes["RULE_VALIDATION_ERROR"] = "RULE_VALIDATION_ERROR";
    ValidationErrorTypes["TYPE_ERROR"] = "TYPE_ERROR";
})(ValidationErrorTypes = exports.ValidationErrorTypes || (exports.ValidationErrorTypes = {}));
function validateState(stateConfig) {
    if (typeof stateConfig !== "object") {
        return {
            isValid: false,
            errors: [
                {
                    errorCode: ValidationErrorTypes.TYPE_ERROR,
                    message: "Provided input is of incorrect type. Expected 'object', received " + typeof stateConfig,
                },
            ],
        };
    }
    var stateType = stateConfig.Type;
    var schema = schemas_1.ValidateStateHelper[stateType];
    var noMatchingSchemaError = {
        isValid: false,
        errors: [
            {
                errorCode: ValidationErrorTypes.SCHEMA_VALIDATION_ERROR,
                message: "State.Type of " + stateType + " is not a supported. Please ensure the provided input has a Type key that is a supported Playbook Type",
            },
        ],
    };
    return schema
        ? validateWithSchema(schema, stateConfig)
        : noMatchingSchemaError;
}
exports.validateState = validateState;
/**
 * Validates that a SOCless Playbook definition has the correct JSON schema
 * AND follows all ASL rules.
 * NOTE: This function is not fully implemented but is ready for use in an alpha state
 * @param definition SOCless playbook definition
 */
function validatePlaybook(definition) {
    //TODO: Extend this to return the results from validateASLRules as well'
    var schemaValidationResult = validatePlaybookObjectSchema(definition);
    if (!schemaValidationResult.isValid) {
        return schemaValidationResult;
    }
    return validatePlaybookHasUniqueStateNames(definition);
}
exports.validatePlaybook = validatePlaybook;
/**
 * Validates that the JSON structures within a playbook JSON obey the appropriate schema
 * DOES NOT completely validate that the playbook is valid according to all the rules laid
 * laid out in the Amazon States Language spec. Examples of rules not checked by this function
 * include:
 * - Ensuring a playbook has a terminal state
 * - Ensuring all states within the playbook are reachable
 */
function validatePlaybookObjectSchema(definition) {
    if (definition === undefined) {
        throw new Error("Playbook definition is undefined");
    }
    return validateWithSchema(schemas_1.PlaybookSchema, definition);
}
exports.validatePlaybookObjectSchema = validatePlaybookObjectSchema;
function validatePlaybookHasUniqueStateNames(definition) {
    var stateNames = getStateNames(definition.States);
    var uniqueStatenames = new Set(stateNames);
    if (uniqueStatenames.size === stateNames.length) {
        return {
            isValid: true,
            errors: [],
        };
    }
    else {
        var countStateNameFrequenciesReducer = function (frequencyMap, currentStateName) {
            frequencyMap[currentStateName] =
                (frequencyMap[currentStateName] || 0) + 1;
            return frequencyMap;
        };
        var stateNameFrequencies = stateNames.reduce(countStateNameFrequenciesReducer, {});
        var duplicatedStates = Object.entries(stateNameFrequencies).reduce(function (duplicatesAccumulator, _a) {
            var stateName = _a[0], stateCount = _a[1];
            if (stateCount > 1) {
                duplicatesAccumulator.push(stateName);
            }
            return duplicatesAccumulator;
        }, []);
        return {
            isValid: false,
            errors: [
                {
                    errorCode: ValidationErrorTypes.RULE_VALIDATION_ERROR,
                    message: "The following states in the playbook are duplicated: " + duplicatedStates.join(", "),
                },
            ],
        };
    }
}
exports.validatePlaybookHasUniqueStateNames = validatePlaybookHasUniqueStateNames;
/**
 * Uses a Joi Schema to Validate data
 */
function validateWithSchema(joiSchema, data) {
    var _a;
    var validationResult = joiSchema.validate(data);
    var isValid = validationResult.error ? false : true;
    var errorDetails = ((_a = validationResult.error) === null || _a === void 0 ? void 0 : _a.details) || [];
    var errors = isValid ? [] : restructureJoiErrorItems(errorDetails);
    return {
        isValid: isValid,
        errors: errors,
    };
}
function restructureJoiErrorItems(errors) {
    return errors.map(function (_a) {
        var message = _a.message, context = _a.context;
        var additionalContext = (context === null || context === void 0 ? void 0 : context.message) ? " " + context.message : "";
        var fullError = message + "." + additionalContext;
        return {
            message: fullError,
            errorCode: ValidationErrorTypes.SCHEMA_VALIDATION_ERROR,
        };
    });
}
function getStateNames(StatesObj) {
    function stateNameReducer(nameAccumulator, _a) {
        var stateName = _a[0], stateConfig = _a[1];
        nameAccumulator.push(stateName);
        if (stateConfig.Type === "Map") {
            nameAccumulator.push.apply(nameAccumulator, Object.entries(stateConfig.Iterator.States).reduce(stateNameReducer, []));
        }
        if (stateConfig.Type === "Parallel") {
            stateConfig.Branches.forEach(function (branch) {
                nameAccumulator.push.apply(nameAccumulator, Object.entries(branch.States).reduce(stateNameReducer, []));
            });
        }
        return nameAccumulator;
    }
    return Object.entries(StatesObj).reduce(stateNameReducer, []);
}
