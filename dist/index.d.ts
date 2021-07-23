import { StepFunction, State } from "./stepFunction";
import { PlaybookDefinition, SoclessTaskStepParameters } from "./socless_psuedo_states";
import { StateMachineYaml } from "./sls_apb";
export declare class apb {
    apb_config: any;
    DecoratorFlags: any;
    States: Record<string, State>;
    StateMachine?: StepFunction;
    Decorators: Record<string, any>;
    PlaybookName: string;
    StateMachineYaml: StateMachineYaml;
    constructor(definition: PlaybookDefinition, apb_config?: {});
    validateTopLevelKeys(definition: PlaybookDefinition): void;
    isDefaultRetryDisabled(stateName: string): any;
    validateTaskFailureHandlerDecorator(config: any): boolean;
    taskErrorHandlerExists(): any;
    genIntegrationHelperStateName(originalName: string): string;
    genTaskFailureHandlerCatchConfig(stateName: string): {
        ErrorEquals: string[];
        ResultPath: string;
        Next: any;
    };
    genHelperState(stateConfig: any, stateName: string): {
        Type: string;
        Result: {
            Name: string;
            Parameters: any;
        };
        ResultPath: string;
        Next: string;
    };
    genTaskFailureHandlerStates(TaskFailureHandler: any): {
        [x: number]: any;
    };
    resolveStateName(stateName: string, States?: Record<string, State>): string;
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
    generate_playbook_formatter_step(start_at_step_name: string): {
        PLAYBOOK_FORMATTER: {
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
    generate_playbook_setup_steps(start_at_step_name: string): {
        PLAYBOOK_FORMATTER: {
            Type: string;
            Parameters: {
                "execution_id.$": string;
                "artifacts.$": string;
                results: {};
                errors: {};
            };
            Next: string;
        };
        Setup_Socless_Global_State: {
            Type: string;
            Resource: string;
            Parameters: {
                "execution_id.$": string;
                "playbook_name.$": string;
                "playbook_event_details.$": string;
            };
            Next: string;
        };
        Was_Playbook_Direct_Executed: {
            Type: string;
            Choices: {
                And: {
                    Variable: string;
                    IsPresent: boolean;
                }[];
                Next: string;
            }[];
            Default: string;
        };
    };
}
