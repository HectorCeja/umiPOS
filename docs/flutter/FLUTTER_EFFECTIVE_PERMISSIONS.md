# Flutter Effective Permissions

Flutter evaluates the registered backend permissions for the selected organization and branch. The productive coordinator never treats hidden UI as authorization and the backend remains authoritative for every command.

Part 4D currently consumes `sales.*`, `cash.*`, receipt and diagnostics permissions individually. Productive certification remains blocked until the complete permission matrix is exercised against real multi-tenant E2E.
