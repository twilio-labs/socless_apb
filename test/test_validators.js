const assert = require("assert");
const {
  validatePlaybook,
  validateHasUniqueStateNames,
  ValidationErrorTypes,
} = require("../dist/validators");
const {
  pb_parallel_and_interaction,
  pb_task_failure_handler,
  pb_parse_nonstring,
  socless_slack_integration_test_playbook,
  pb_with_missing_top_level_keys,
  hello_world,
} = require("./mocks");

describe("validatePlaybook", () => {
  it("Validation Succeeds with Valid Playbooks", () => {
    const validPlaybooks = [
      hello_world,
      pb_parallel_and_interaction,
      socless_slack_integration_test_playbook,
      pb_parse_nonstring,
      pb_task_failure_handler,
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
    const { isValid, errors } = validatePlaybook(
      pb_with_missing_top_level_keys
    );
    assert(!isValid);
    assert(errors.length > 0);
  });
});

describe("validatePlaybookHasUniqueNames", () => {
  it("Returns valid for a playbook with only unique state names", () => {
    const validPlaybooks = [hello_world, pb_parallel_and_interaction];

    validPlaybooks
      .map((playbook) => validateHasUniqueStateNames(playbook))
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
    // Use prettier ignore here to keep the object as raw json so that
    // we can duplicate the StateA key without typescript yelling
    // prettier-ignore
    const playbookWithDuplicateStates = {
      "Playbook": "Duplicate States",
      "StartAt": "StateA",
      "States": {
        "StateA": {
          "Type": "Pass",
          "Next": "StateB",
        },
        "StateB": {
          "Type": "Parallel",
          "End": true,
          "Branches": [
            {
              "StartAt": "StateA",
              "States": {
                "StateA": {
                  "Type": "Pass",
                  "End": true,
                },
              },
            },
          ],
        },
      },
    };

    const result = validateHasUniqueStateNames(playbookWithDuplicateStates);
    assert(!result.isValid);
    assert(
      result.errors[0].errorCode == ValidationErrorTypes.RULE_VALIDATION_ERROR
    );
    console.log(result);
  });
});
