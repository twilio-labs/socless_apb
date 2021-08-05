const assert = require("assert");
const { validatePlaybook } = require("../dist/validators");
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
