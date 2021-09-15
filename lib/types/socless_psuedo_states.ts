import { BaseStateAction, StepFunction } from ".";

// SOCless custom StepFunction (called a Playbook)
export interface PlaybookDefinition extends StepFunction {
  Playbook: string;
  Decorators?: Record<string, unknown>;
}

// SOCless custom state (will be transformed by apb into an AWS state)
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
  FunctionName: string; // AWS Lambda Resource
  Payload: {
    "sfn_context.$": SoclessTaskStepParameters;
    "task_token.$": "$$.Task.Token";
  };
}
