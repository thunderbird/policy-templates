# ADMX/ADML schemas

The official XML schemas of ADMX and ADML files, used to validate the generated
templates (see `modules/validate_admx.mjs`).

## Source

[MS-GPREG]: Group Policy: Registry Extension Encoding, section 7:

- `BaseTypes.xsd`: https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-gpreg/81d92810-a6d2-4301-a607-b3ba34dc2989
- `PolicyDefinitions.xsd`: https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-gpreg/81a89003-5121-4216-b788-fde8daa71c78
- `PolicyDefinitionFiles.xsd`: https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-gpreg/ddeb37b6-22ab-4936-adc4-b9d7fe1de6e6

The Intellectual Property Rights Notice of the Open Specifications states:
"You can also distribute in your implementation, with or without modification,
any schemas, IDLs, or code samples that are included in the documentation."

## Modifications

- The hard line wraps of the published text were removed.
- The target namespace was changed from
  `http://www.microsoft.com/GroupPolicy/PolicyDefinitions` to
  `http://schemas.microsoft.com/GroupPolicy/2006/07/PolicyDefinitions`, which is
  the namespace used by actual ADMX and ADML files.
