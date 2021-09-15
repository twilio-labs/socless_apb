import { BaseStateAction, StepFunction } from ".";
export interface PlaybookDefinition extends StepFunction {
    Playbook: string;
    Decorators?: Record<string, unknown>;
}
export interface InteractionState extends BaseStateAction {
    Type: "Interaction";
    Resource: string;
    TimeoutSeconds?: number;
    TimeoutSecondsPath?: string;
    HeartbeatSeconds?: number;
    HeartbeatSecondsPath?: string;
}
export interface SoclessTaskStepParameters {
    "execution_id.$": "$.execution_id";
    "artifacts.$": "$.artifacts";
    "errors.$": "$.errors";
    "results.$": "$.results";
    State_Config: {
        Name: string;
        Parameters: Record<string, unknown>;
    };
}
export interface SoclessInteractionStepParameters {
    FunctionName: string;
    Payload: {
        "sfn_context.$": SoclessTaskStepParameters;
        "task_token.$": "$$.Task.Token";
    };
}
