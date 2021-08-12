"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHasUniqueStateNames = exports.validateStateName = exports.validatePlaybookName = exports.validatePlaybook = exports.ValidationErrorTypes = void 0;
var ajv_1 = __importDefault(require("ajv"));
var choice_json_1 = __importDefault(require("./schemas/choice.json"));
var fail_json_1 = __importDefault(require("./schemas/fail.json"));
var map_json_1 = __importDefault(require("./schemas/map.json"));
var parallel_json_1 = __importDefault(require("./schemas/parallel.json"));
var pass_json_1 = __importDefault(require("./schemas/pass.json"));
var state_machine_json_1 = __importDefault(require("./schemas/state-machine.json"));
var state_json_1 = __importDefault(require("./schemas/state.json"));
var succeed_json_1 = __importDefault(require("./schemas/succeed.json"));
var task_json_1 = __importDefault(require("./schemas/task.json"));
var wait_json_1 = __importDefault(require("./schemas/wait.json"));
var decorators_schema_json_1 = __importDefault(require("./schemas/decorators-schema.json"));
var playbook_json_1 = __importDefault(require("./schemas/playbook.json"));
var decorator_task_json_1 = __importDefault(require("./schemas/decorator-task.json"));
// build an instance of ajv using schemas that for a valid  playbook.json
var ajv = new ajv_1.default({
    schemas: [
        playbook_json_1.default,
        decorator_task_json_1.default,
        state_machine_json_1.default,
        decorators_schema_json_1.default,
        choice_json_1.default,
        fail_json_1.default,
        map_json_1.default,
        parallel_json_1.default,
        pass_json_1.default,
        state_json_1.default,
        succeed_json_1.default,
        task_json_1.default,
        wait_json_1.default,
    ],
    allErrors: true,
});
var ValidationErrorTypes;
(function (ValidationErrorTypes) {
    ValidationErrorTypes["SCHEMA_VALIDATION_ERROR"] = "SCHEMA_VALIDATION_ERROR";
    ValidationErrorTypes["RULE_VALIDATION_ERROR"] = "RULE_VALIDATION_ERROR";
})(ValidationErrorTypes = exports.ValidationErrorTypes || (exports.ValidationErrorTypes = {}));
/**
 * Transforms ajv error objects into our ValidationErrorObject
 * @param errors list of ajv ErrorObjects
 */
function restructureAjvErrors(errors) {
    return errors.map(function (errObj) { return ({
        errorCode: ValidationErrorTypes.SCHEMA_VALIDATION_ERROR,
        message: errObj.keyword + " " + errObj.instancePath + " " + errObj.message + ". " + Object.entries(errObj.params)
            .map(function (each) { return each.join(":"); })
            .join(", "),
    }); });
}
function createSchemaValidator(schema) {
    var ajvValidator = ajv.compile(schema);
    if (typeof ajvValidator === "undefined") {
        throw new Error("Unable to retrieve a validator from AJV for the provided schema " + schema);
    }
    var validator = function (data) {
        var isValid = ajvValidator(data);
        if (typeof isValid !== "boolean") {
            throw new Error("Ajv validator returned non-boolean response. This is an unexpected internal error that needs debugging");
        }
        var errors = ajvValidator.errors
            ? restructureAjvErrors(ajvValidator.errors)
            : [];
        return {
            isValid: isValid,
            errors: errors,
        };
    };
    return validator;
}
/**
 * Validates that the JSON structures within a playbook JSON obey the appropriate schema
 * DOES NOT completely validate that the playbook is valid according to all the rules laid
 * laid out in the Amazon States Language spec. Examples of rules not checked by this function
 * include:
 * - Ensuring a playbook has a terminal state
 * - Ensuring all states within the playbook are reachable
 */
function validatePlaybookJsonSchema(definition) {
    if (definition === undefined) {
        throw new Error("Playbook definition is undefined");
    }
    var validate = ajv.getSchema(playbook_json_1.default.$id);
    if (typeof validate === "undefined") {
        throw new Error("Failed to create validator for playbookJsonSchema.");
    }
    var isValid = validate(definition);
    if (typeof isValid !== "boolean") {
        throw new Error("Ajv validator returned non-boolean response. This needs internal investigation into why");
    }
    var validationErrs = validate.errors;
    var errors = [];
    if (validationErrs) {
        errors = restructureAjvErrors(validationErrs);
    }
    return {
        isValid: isValid,
        errors: errors,
    };
}
/**
 * Validates that a SOCless Playbook definition has the correct JSON schema
 * AND follows all ASL rules.
 * NOTE: This function is not fully implemented but is ready for use in an alpha state
 * @param definition SOCless playbook definition
 */
function validatePlaybook(definition) {
    //TODO: Extend this to return the results from validateASLRules as well
    return validatePlaybookJsonSchema(definition);
}
exports.validatePlaybook = validatePlaybook;
/**
 * Validate that a Playbook's name abides by the expected schema in
 * schemas/playbook.json:$.properties.Playbook
 */
exports.validatePlaybookName = createSchemaValidator(playbook_json_1.default.properties.Playbook);
/**
 * Validates that a State name abides by the schema
 */
exports.validateStateName = createSchemaValidator(playbook_json_1.default.properties.States.propertyNames);
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
/**
 * Validate that all states names in the State machine are unique
 */
function validateHasUniqueStateNames(definition) {
    var stateNames = getStateNames(definition.States);
    var stateNameSet = new Set(stateNames);
    if (stateNameSet.size === stateNames.length) {
        return {
            isValid: true,
            errors: [],
        };
    }
    else {
        return {
            isValid: false,
            errors: [
                {
                    errorCode: ValidationErrorTypes.RULE_VALIDATION_ERROR,
                    message: "Detected duplicated states in the playbook",
                },
            ],
        };
    }
}
exports.validateHasUniqueStateNames = validateHasUniqueStateNames;
