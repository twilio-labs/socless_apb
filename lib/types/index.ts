export * from "./step_function";
export * from "./socless_psuedo_states";
import {
  TaskState,
  FailState,
  SucceedState,
  MapState,
  ChoiceState,
  ParallelState,
  PassState,
  WaitState,
  InteractionState,
  CloudFormationStateMachine,
} from ".";

export interface ApbConfig {
  logging?: boolean;
  playbooksFolder?: string;
}

export interface SlsApbVariableResolutionHelper {
  statesExecutionRole: string;
  renderedPlaybooks: object;
}

export interface CompleteStateMachineCloudFormation {
  Resources: Record<string, CloudFormationStateMachine | unknown>;
  Outputs: object;
}

export declare type State =
  | TaskState
  | ParallelState
  | MapState
  | PassState
  | WaitState
  | ChoiceState
  | SucceedState
  | FailState
  | InteractionState;
