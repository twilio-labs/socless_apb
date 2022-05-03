const assert = require("assert");
const {
  validatePlaybook,
  validatePlaybookHasUniqueStateNames,
  ValidationErrorTypes,
  validateState,
  validatePlaybookObjectSchema,
} = require("../dist/validators");
const {
  pb_parallel_and_interaction,
  pb_task_failure_handler,
  pb_parse_nonstring,
  socless_slack_integration_test_playbook,
  pb_with_missing_top_level_keys,
  hello_world,
  choice_validation_playbook,
} = require("./mocks");

describe("validatePlaybook", () => {
  it("Validation Succeeds with Valid Playbooks", () => {
    const validPlaybooks = [
      hello_world,
      pb_parallel_and_interaction,
      socless_slack_integration_test_playbook,
      pb_parse_nonstring,
      pb_task_failure_handler,
      choice_validation_playbook,
    ];

    validPlaybooks
      .map((playbook) => validatePlaybook(playbook))
      .map(({ isValid, errors }, index) => {
        assert(
          isValid,
          `Playbook with index ${index} in list of tested playbooks has the following errors ${JSON.stringify(
            errors,
            null,
            2
          )}`
        );
        assert(errors.length === 0);
      });
  });

  it("Validation Fails and returns errors given invalid playbooks", () => {
    const { isValid, errors } = validatePlaybook(pb_with_missing_top_level_keys);
    assert(!isValid);
    assert(errors.length > 0);
  });
});

describe("validatePlaybookHasUniqueNames", () => {
  it("Returns valid for a playbook with only unique state names", () => {
    const validPlaybooks = [hello_world, pb_parallel_and_interaction];

    validPlaybooks
      .map((playbook) => validatePlaybookHasUniqueStateNames(playbook))
      .map(({ isValid, errors }, index) => {
        assert(
          isValid,
          `Playbook with index ${index} in list of tested playbooks has the following errors ${JSON.stringify(
            errors,
            null,
            2
          )}`
        );
        assert(errors.length === 0);
      });
  });

  it("Returns invalid for a playbook with duplicate state names", () => {
    const playbookWithDuplicateStates = {
      Playbook: "PlaybookWithDuplicateStates",
      StartAt: "StateA",
      States: {
        StateA: {
          Type: "Pass",
          Next: "StateB",
        },
        StateC: {
          Type: "Pass",
          Next: "StateB",
        },
        Validate_All: {
          Type: "Map",
          InputPath: "$.detail",
          ItemsPath: "$.shipped",
          MaxConcurrency: 0,
          ResultPath: "$.detail.shipped",
          Parameters: {
            "parcel.$": "$$.Map.Item.Value",
            "courier.$": "$.delivery-partner",
          },
          Iterator: {
            StartAt: "Validate",
            States: {
              Validate: {
                Type: "Task",
                Resource: "arn:aws:lambda:us-east-1:123456789012:function:ship-val",
                End: true,
              },
              ValidateAgain: {
                Type: "Task",
                Resource: "arn:aws:lambda:us-east-1:123456789012:function:ship-val",
                End: true,
              },
              StateC: {
                Type: "Pass",
                Next: "StateB",
              },
            },
          },
          End: true,
        },
        StateB: {
          Type: "Parallel",
          End: true,
          Branches: [
            {
              StartAt: "StateA",
              States: {
                StateA: {
                  Type: "Pass",
                  End: true,
                },
              },
            },
          ],
        },
      },
    };

    const result = validatePlaybookHasUniqueStateNames(playbookWithDuplicateStates);
    assert(!result.isValid);
    assert(result.errors[0].errorCode == ValidationErrorTypes.RULE_VALIDATION_ERROR);
  });
});

describe("validateState", () => {
  it("Correctly Validates all State Types when given Valid Configs", () => {
    const validPlaybooks = [
      hello_world,
      pb_parallel_and_interaction,
      socless_slack_integration_test_playbook,
      pb_parse_nonstring,
      pb_task_failure_handler,
    ];

    validPlaybooks.forEach((playbook, index) => {
      Object.values(playbook.States).forEach((stateConfig) => {
        const { isValid, errors } = validateState(stateConfig);
        assert(
          isValid,
          `Playbook with name ${playbook.Playbook} failed because ${JSON.stringify(
            errors,
            null,
            2
          )}`
        );
        assert(errors.length === 0);
      });
    });
  });

  it("Correctly Invalidates States that have invalid configs", () => {
    const invalidStates = [
      {
        Type: "Task",
        //No required Resource
        InputPath: "$.input.path.here",
        Parameters: {
          hello: "world",
        },
        Next: "PassThere",
      },
      {
        // No Next/End
        Type: "Pass",
      },
      {
        Type: "Wait",
        //Not Seconds, SecondsTimestamp or other
        Next: "WaitTimestamp",
      },
      {
        Type: "Fail",
        //invalid additonal key
        Foobar: "",
      },
      {
        Type: "Succeed",
        // invalid-added-key
        Fobar: "Bad thing",
      },
      {
        Type: "Wait",
        // Timestamp no iso date
        Timestamp: "NOT ISO DATE",
        Next: "WaitSecondsPath",
      },
      {
        Type: "Wait",
        // Not a path with $.
        SecondsPath: "Not.A.Path",
        Next: "WaitTimestampPath",
      },
      {
        // no-iterator
        Type: "Map",
        InputPath: "$.detail",
        ItemsPath: "$.shipped",
        MaxConcurrency: 0,
        ResultPath: "$.detail.shipped",
        End: true,
      },
      {
        Type: "Choice",
        Choices: [
          {
            Not: {
              Variable: "$.type",
              StringEquals: "Private",
              // Next not allowed here
              Next: "FailWail",
            },
            Next: "Public",
          },
          {
            Variable: "$.value",
            NumericEquals: 0,
            // no Next here
          },
          {
            And: [
              {
                Variable: "$.value",
                NumericGreaterThanEquals: 20,
              },
              {
                Variable: "$.value",
                NumericLessThan: 30,
              },
            ],
            Next: "ValueInTwenties",
          },
        ],
        Default: "DefaultState",
      },
      {
        Type: "Parallel",
        End: true,
        // No branches
      },
    ];

    invalidStates.forEach((state) => {
      const { isValid, errors } = validateState(state);
      assert(
        !isValid,
        `State passed validation when it should have failed ${JSON.stringify(state, null, 2)}`
      );
      assert(errors.length > 0);
    });
  });
});
