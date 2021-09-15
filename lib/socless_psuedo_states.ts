import { State, StepFunction, CommonStateFields, PassState } from "./stepFunction";

// deprecated
export interface HelperStateFinalized extends PassState {
  Type: "Pass";
  Result: {
    Name: string;
    Parameters: Record<string, any>;
  };
  ResultPath: "$.State_Config";
  Next: string;
}

export interface PlaybookDefinition {
  Playbook: string;
  Comment?: string;
  StartAt: string;
  States: Record<string, State>;
  Decorators?: Record<string, unknown>;
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
