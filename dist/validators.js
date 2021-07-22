"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePlaybook = void 0;
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
/**
 * Transforms ajv error objects into our ValidationErrorObject
 * @param errors list of ajv ErrorObjects
 */
function restructureAjvErrors(errors) {
    return errors.map(function (errObj) { return ({
        errorCode: "SCHEMA_VALIDATION_ERROR",
        message: errObj.dataPath + " " + errObj.message + ". " + Object.entries(errObj.params)
            .map(function (each) { return each.join(":"); })
            .join(", "),
    }); });
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
    // build an instance of ajv using schemas that for a valid  playbook.json
    var ajv = new ajv_1.default({
        schemas: [
            playbook_json_1.default,
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
