export interface ValidationErrorObject {
    errorCode: string;
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
