import Ajv, { ErrorObject } from "ajv";
import choiceSchema from "./schemas/choice.json";
import failSchema from "./schemas/fail.json";
import mapSchema from "./schemas/map.json";
import parallelSchema from "./schemas/parallel.json";
import passSchema from "./schemas/pass.json";
import stateMachineSchema from "./schemas/state-machine.json";
import stateSchema from "./schemas/state.json";
import succeedSchema from "./schemas/succeed.json";
import taskSchema from "./schemas/task.json";
import waitSchema from "./schemas/wait.json";
import decoratorSchema from "./schemas/decorators-schema.json";
import playbookSchema from "./schemas/playbook.json";
import decoratorTaskSchema from "./schemas/decorator-task.json";

// build an instance of ajv using schemas that for a valid  playbook.json
const ajv = new Ajv({
  schemas: [
    playbookSchema,
    decoratorTaskSchema,
    stateMachineSchema,
    decoratorSchema,
    choiceSchema,
    failSchema,
    mapSchema,
    parallelSchema,
    passSchema,
    stateSchema,
    succeedSchema,
    taskSchema,
    waitSchema,
  ],
  allErrors: true,
});

export interface ValidationErrorObject {
  errorCode: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrorObject[];
}

/**
 * Transforms ajv error objects into our ValidationErrorObject
 * @param errors list of ajv ErrorObjects
 */
function restructureAjvErrors(errors: ErrorObject[]): ValidationErrorObject[] {
  return errors.map((errObj: ErrorObject) => ({
    errorCode: "SCHEMA_VALIDATION_ERROR",
    message: `${errObj.keyword} ${errObj.instancePath} ${
      errObj.message
    }. ${Object.entries(errObj.params)
      .map((each) => each.join(":"))
      .join(", ")}`,
  }));
}

function createSchemaValidator(schema: object) {
  const ajvValidator = ajv.compile(schema);

  if (typeof ajvValidator === "undefined") {
    throw new Error(
      `Unable to retrieve a validator from AJV for the provided schema ${schema}`
    );
  }

  const validator = (data): ValidationResult => {
    const isValid = ajvValidator(data);

    if (typeof isValid !== "boolean") {
      throw new Error(
        "Ajv validator returned non-boolean response. This is an unexpected internal error that needs debugging"
      );
    }
    const errors = ajvValidator.errors
      ? restructureAjvErrors(ajvValidator.errors)
      : [];
    return {
      isValid,
      errors,
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
function validatePlaybookJsonSchema(definition): ValidationResult {
  if (definition === undefined) {
    throw new Error("Playbook definition is undefined");
  }

  const validate = ajv.getSchema(playbookSchema.$id);
  if (typeof validate === "undefined") {
    throw new Error("Failed to create validator for playbookJsonSchema.");
  }
  const isValid = validate(definition);
  if (typeof isValid !== "boolean") {
    throw new Error(
      "Ajv validator returned non-boolean response. This needs internal investigation into why"
    );
  }
  const validationErrs = validate.errors;

  let errors: ValidationErrorObject[] = [];
  if (validationErrs) {
    errors = restructureAjvErrors(validationErrs);
  }
  return {
    isValid,
    errors,
  };
}

/**
 * Validates that a SOCless Playbook definition has the correct JSON schema
 * AND follows all ASL rules.
 * NOTE: This function is not fully implemented but is ready for use in an alpha state
 * @param definition SOCless playbook definition
 */
export function validatePlaybook(definition): ValidationResult {
  //TODO: Extend this to return the results from validateASLRules as well
  return validatePlaybookJsonSchema(definition);
}

/**
 * Validate that a Playbook's name abides by the expected schema in
 * schemas/playbook.json:$.properties.Playbook
 */
export const validatePlaybookName = createSchemaValidator(
  playbookSchema.properties.Playbook
);

/**
 * Validates that a State name abides by the schema
 */
export const validateStateName = createSchemaValidator(
  playbookSchema.properties.States.propertyNames
);
