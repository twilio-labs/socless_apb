# Schemas

This folder contains JSON Schemas used for validation of input data

The schemas in this section are lifted from [asl-validator library](https://github.com/ChristopheBougere/asl-validator/tree/master/src/schemas) and modified to support the SOCless Playbook Schema.

**Note from developer:** Lifting all the schemas was probably overkill as some of them can be used as-is by importing them from asl-validator. They were lifted and put here to support the effort to get validation working first, as lifting all of them was faster than figuring out which ones could be lifted as-is vs which ones needed slight modification. In the future, this can likely be refactored to import them from asl-validator instead, reducing the amount of code managed here.

Changes that were made to the provided schemas include:

- task.json schema pattern for Type property was modified from `^Task$` to `^(Task|Interaction)$` to account for SOCless Playbooks Interaction state which have the same schema as task
- wait.json: Seconds was update from number to a pattern that allows either a number or the pattern `apb_render_nonstring_value()` which SOCless playbooks allow
