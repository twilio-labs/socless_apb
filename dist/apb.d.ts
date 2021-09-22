import { PlaybookDefinition, SoclessTaskStepParameters, StepFunction, State, CompleteStateMachineCloudFormation, ApbConfig } from "./types";
export declare class apb {
    apb_config: ApbConfig;
    DecoratorFlags: any;
    States: Record<string, State>;
    StateMachine?: StepFunction;
    Decorators: Record<string, any>;
    PlaybookName: string;
    StateMachineYaml: CompleteStateMachineCloudFormation;
    constructor(definition: PlaybookDefinition, apb_config?: {});
    isDefaultRetryDisabled(stateName: string): any;
    taskErrorHandlerExists(): any;
    genTaskFailureHandlerCatchConfig(stateName: string): {
        ErrorEquals: string[];
        ResultPath: string;
        Next: any;
    };
    genTaskFailureHandlerStates(TaskFailureHandler: any): {
        [x: number]: any;
    };
    transformCatchConfig(catchConfig: any, States: Record<string, State>): any;
    transformRetryConfig(retryConfig: any, stateName: string): any;
    defaultTransformState(stateName: any, stateConfig: any, States: any): {
        [x: number]: any;
    };
    transformChoiceState(stateName: any, stateConfig: any, States?: Record<string, State>): {
        [x: number]: any;
    };
    generateParametersForSoclessTask(state_name: string, handle_state_kwargs: Record<string, any>): SoclessTaskStepParameters;
    generateParametersForSoclessInteraction(state_name: string, handle_state_kwargs: Record<string, any>, function_name: string): {
        FunctionName: string;
        Payload: {
            sfn_context: SoclessTaskStepParameters;
            "task_token.$": string;
        };
    };
    transformTaskState(stateName: string, stateConfig: any, States: any, DecoratorFlags: any): {};
    transformInteractionState(stateName: any, stateConfig: any, States: any, DecoratorFlags: any): {};
    transformParallelState(stateName: any, stateConfig: any, States: any, DecoratorFlags: any): {
        [x: string]: {};
        [x: number]: {};
    };
    transformStates(States?: Record<string, State>, DecoratorFlags?: any): {};
    buildLoggingConfiguration(): {};
    generatePlaybookFormatterStep(startAtStepName: string): {
        [x: string]: {
            Type: string;
            Parameters: {
                "execution_id.$": string;
                "artifacts.$": string;
                results: {};
                errors: {};
            };
            Next: string;
        };
    };
    generate_playbook_setup_steps(startAtStepName: string): {
        [x: string]: {
            Type: string;
            Choices: {
                And: {
                    Variable: string;
                    IsPresent: boolean;
                }[];
                Next: string;
            }[];
            Default: string;
        } | {
            Type: string;
            Resource: string;
            Parameters: {
                "execution_id.$": string;
                "playbook_name.$": string;
                "playbook_event_details.$": string;
            };
            Next: string;
        } | {
            Type: string;
            Parameters: {
                "execution_id.$": string;
                "artifacts.$": string;
                results: {};
                errors: {};
            };
            Next: string;
        };
    };
}
