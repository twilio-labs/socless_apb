export declare enum ValidationErrorTypes {
    SCHEMA_VALIDATION_ERROR = "SCHEMA_VALIDATION_ERROR",
    RULE_VALIDATION_ERROR = "RULE_VALIDATION_ERROR"
}
export interface ValidationErrorObject {
    errorCode: ValidationErrorTypes;
    message: string;
}
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationErrorObject[];
}
/**
 * Validates that a SOCless Playbook definition has the correct JSON schema
 * AND follows all ASL rules.
 * NOTE: This function is not fully implemented but is ready for use in an alpha state
 * @param definition SOCless playbook definition
 */
export declare function validatePlaybook(definition: any): ValidationResult;
/**
 * Validate that a Playbook's name abides by the expected schema in
 * schemas/playbook.json:$.properties.Playbook
 */
export declare const validatePlaybookName: (data: any) => ValidationResult;
/**
 * Validates that a State name abides by the schema
 */
export declare const validateStateName: (data: any) => ValidationResult;
/**
 * Validate that all states names in the State machine are unique
 */
export declare function validateHasUniqueStateNames(definition: any): ValidationResult;
