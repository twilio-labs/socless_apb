// import mock data from sibling files
const general_playbooks = require("./playbooks/general");
const task_failure_handlers = require("./playbooks/task_failure_handlers");
const full_playbooks = require("./playbooks/full_playbooks");
const error_playbooks = require("./playbooks/error_playbooks");
const hello_world = require("./playbooks/hello_world/playbook.json");
const choice_validation_playbook = require("./playbooks/choice_validation_playbook/playbook.json");

// re-export for easy usage in tests
module.exports = {
  ...general_playbooks,
  ...task_failure_handlers,
  ...full_playbooks,
  ...error_playbooks,
  ...{ hello_world },
  choice_validation_playbook,
};
