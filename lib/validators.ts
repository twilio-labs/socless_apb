import {
  ValidationErrorItem as JoiValidationErrorItem,
  ObjectSchema as JoiObjectSchema,
} from "joi";
import {
  FailSchema,
  SucceedSchema,
  PassSchema,
  ChoiceSchema,
  TaskSchema,
  WaitSchema,
  ParallelSchema,
  StateMachineSchema,
  PlaybookSchema,
  TaskFailureHandlerSchema,
  MapSchema,
  ValidateStateHelper,
} from "./schemas";

export enum ValidationErrorTypes {
  SCHEMA_VALIDATION_ERROR = "SCHEMA_VALIDATION_ERROR",
  RULE_VALIDATION_ERROR = "RULE_VALIDATION_ERROR",
  TYPE_ERROR = "TYPE_ERROR",
}

export interface ValidationErrorObject {
  errorCode: ValidationErrorTypes;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrorObject[];
}

export function validateState(stateConfig: any): ValidationResult {
  if (typeof stateConfig !== "object") {
    return {
      isValid: false,
      errors: [
        {
          errorCode: ValidationErrorTypes.TYPE_ERROR,
          message: `Provided input is of incorrect type. Expected 'object', received ${typeof stateConfig}`,
        },
      ],
    };
  }

  const stateType = stateConfig.Type;
  const schema = ValidateStateHelper[stateType];

  const noMatchingSchemaError: ValidationResult = {
    isValid: false,
    errors: [
      {
        errorCode: ValidationErrorTypes.SCHEMA_VALIDATION_ERROR,
        message: `State.Type of ${stateType} is not a supported. Please ensure the provided input has a Type key that is a supported Playbook Type`,
      },
    ],
  };
  return schema
    ? validateWithSchema(schema, stateConfig)
    : noMatchingSchemaError;
}

/**
 * Validates that a SOCless Playbook definition has the correct JSON schema
 * AND follows all ASL rules.
 * NOTE: This function is not fully implemented but is ready for use in an alpha state
 * @param definition SOCless playbook definition
 */
export function validatePlaybook(definition): ValidationResult {
  //TODO: Extend this to return the results from validateASLRules as well'
  const schemaValidationResult = validatePlaybookObjectSchema(definition);

  if (!schemaValidationResult.isValid) {
    return schemaValidationResult;
  }
  return validatePlaybookHasUniqueStateNames(definition);
}

/**
 * Validates that the JSON structures within a playbook JSON obey the appropriate schema
 * DOES NOT completely validate that the playbook is valid according to all the rules laid
 * laid out in the Amazon States Language spec. Examples of rules not checked by this function
 * include:
 * - Ensuring a playbook has a terminal state
 * - Ensuring all states within the playbook are reachable
 */
export function validatePlaybookObjectSchema(definition): ValidationResult {
  if (definition === undefined) {
    throw new Error("Playbook definition is undefined");
  }
  return validateWithSchema(PlaybookSchema, definition);
}

export function validatePlaybookHasUniqueStateNames(
  definition
): ValidationResult {
  const stateNames: string[] = getStateNames(definition.States);
  const uniqueStatenames = new Set(stateNames);

  if (uniqueStatenames.size === stateNames.length) {
    return {
      isValid: true,
      errors: [],
    };
  } else {
    const countStateNameFrequenciesReducer = (
      frequencyMap: Record<string, number>,
      currentStateName: string
    ) => {
      frequencyMap[currentStateName] =
        (frequencyMap[currentStateName] || 0) + 1;
      return frequencyMap;
    };

    const stateNameFrequencies = stateNames.reduce(
      countStateNameFrequenciesReducer,
      {}
    );

    const duplicatedStates = Object.entries(stateNameFrequencies).reduce(
      (duplicatesAccumulator: string[], [stateName, stateCount]) => {
        if (stateCount > 1) {
          duplicatesAccumulator.push(stateName);
        }
        return duplicatesAccumulator;
      },
      []
    );

    return {
      isValid: false,
      errors: [
        {
          errorCode: ValidationErrorTypes.RULE_VALIDATION_ERROR,
          message: `The following states in the playbook are duplicated: ${duplicatedStates.join(
            ", "
          )}`,
        },
      ],
    };
  }
}

/**
 * Uses a Joi Schema to Validate data
 */
function validateWithSchema(
  joiSchema: JoiObjectSchema<any>,
  data: unknown
): ValidationResult {
  const validationResult = joiSchema.validate(data);
  const isValid = validationResult.error ? false : true;
  const errorDetails = validationResult.error?.details || [];
  const errors = isValid ? [] : restructureJoiErrorItems(errorDetails);
  return {
    isValid,
    errors,
  };
}

function restructureJoiErrorItems(
  errors: JoiValidationErrorItem[]
): ValidationErrorObject[] {
  return errors.map(({ message, context }) => {
    const additionalContext = context?.message ? ` ${context.message}` : "";
    const fullError = `${message}.${additionalContext}`;
    return {
      message: fullError,
      errorCode: ValidationErrorTypes.SCHEMA_VALIDATION_ERROR,
    };
  });
}

function getStateNames(StatesObj: object) {
  function stateNameReducer(
    nameAccumulator: string[],
    [stateName, stateConfig]: [string, any]
  ) {
    nameAccumulator.push(stateName);
    if (stateConfig.Type === "Map") {
      nameAccumulator.push(
        ...Object.entries(stateConfig.Iterator.States).reduce(
          stateNameReducer,
          []
        )
      );
    }
    if (stateConfig.Type === "Parallel") {
      stateConfig.Branches.forEach((branch: any) => {
        nameAccumulator.push(
          ...Object.entries(branch.States).reduce(stateNameReducer, [])
        );
      });
    }
    return nameAccumulator;
  }

  return Object.entries(StatesObj).reduce(stateNameReducer, []);
}
