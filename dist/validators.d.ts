export declare enum ValidationErrorTypes {
    SCHEMA_VALIDATION_ERROR = "SCHEMA_VALIDATION_ERROR",
    RULE_VALIDATION_ERROR = "RULE_VALIDATION_ERROR",
    TYPE_ERROR = "TYPE_ERROR"
}
export interface ValidationErrorObject {
    errorCode: ValidationErrorTypes;
    message: string;
}
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationErrorObject[];
}
export declare function validateState(stateConfig: any): ValidationResult;
/**
 * Validates that a SOCless Playbook definition has the correct JSON schema
 * AND follows all ASL rules.
 * NOTE: This function is not fully implemented but is ready for use in an alpha state
 * @param definition SOCless playbook definition
 */
export declare function validatePlaybook(definition: any): ValidationResult;
/**
 * Validates that the JSON structures within a playbook JSON obey the appropriate schema
 * DOES NOT completely validate that the playbook is valid according to all the rules laid
 * laid out in the Amazon States Language spec. Examples of rules not checked by this function
 * include:
 * - Ensuring a playbook has a terminal state
 * - Ensuring all states within the playbook are reachable
 */
export declare function validatePlaybookObjectSchema(definition: any): ValidationResult;
export declare function validatePlaybookHasUniqueStateNames(definition: any): ValidationResult;
