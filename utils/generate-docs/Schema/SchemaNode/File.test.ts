import Schema from "../Schema.js";
import { EnumSchemaNodeJson } from "./Enum.js";
import File, { FileSchemaNodeJson } from "./File.js";
import { ObjectSchemaNodeJson } from "./Object.js";
import { PrimitiveSchemaNodeJson } from "./Primitive.js";

const BASE_OBJECT_SCHEMA_NODE_FIXTURE: PrimitiveSchemaNodeJson = {
  $id: "https://raw.githubusercontent.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/main/schema/primitives/objects/Object.schema.json",
  title: "Object - Object",
  description: "Abstract object to be extended by all other objects",
  type: "object",
  properties: {
    id: {
      description: "Identifier for the object",
      type: "string",
    },
    comments: {
      description:
        "Unstructured text comments related to and stored for the object",
      type: "array",
      items: {
        type: "string",
      },
    },
    object_type: {
      description: "Object type field",
      $ref: "https://raw.githubusercontent.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/main/schema/enums/ObjectType.schema.json",
    },
  },
  required: ["id", "object_type"],
};

const OBJECT_SCHEMA_NODE_FIXTURE: ObjectSchemaNodeJson = {
  $id: "https://raw.githubusercontent.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/main/schema/objects/Valuation",
  title: "Object - Valuation",
  description: "Object describing a valuation used in the cap table",
  type: "object",
  allOf: [
    {
      $ref: "https://raw.githubusercontent.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/main/schema/primitives/objects/Object.schema.json",
    },
  ],
  properties: {
    object_type: {
      const: "VALUATION",
    },
    refProperty1: {
      $ref: "https://raw.githubusercontent.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/main/schema/enums/TestEnum.schema.json",
    },
  },
  additionalProperties: false,
  required: ["refProperty1"],
};

const FILE_FIXTURE: FileSchemaNodeJson = {
  $id: "https://raw.githubusercontent.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/main/schema/files/TestFile.schema.json",
  title: "Test Title",
  description: "This is a test fixture exemplifying a File schema from OCF",
  type: "object",
  allOf: [
    {
      $ref: "https://raw.githubusercontent.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/main/schema/primitives/files/File.schema.json",
    },
  ],
  properties: {
    file_type: { const: "OCF_TEST_FILE" },
    items: {
      type: "array",
      description: "Example ref array property",
      items: {
        $ref: "https://raw.githubusercontent.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/main/schema/objects/Valuation",
      },
    },
  },
  required: ["test_property1"],
};

const ENUM_FILE_TYPE_SCHEMA_NODE_FIXTURE: EnumSchemaNodeJson = {
  $id: "https://raw.githubusercontent.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/main/schema/enums/FileType.schema.json",
  title: "Enum - Object Type",
  description: "Enumeration of object types",
  type: "string",
  enum: ["VALUATION"],
};

const BASE_FILE_SCHEMA_NODE_FIXTURE: PrimitiveSchemaNodeJson = {
  $id: "https://raw.githubusercontent.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/main/schema/primitives/files/File.schema.json",
  title: "Object - File",
  description: "Abstract file to be extended by all other files",
  type: "object",
  properties: {},
  required: [],
};

const ENUM_SCHEMA_NODE_FIXTURE: EnumSchemaNodeJson = {
  $id: "https://raw.githubusercontent.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/main/schema/enums/TestEnum.schema.json",
  title: "Test Title",
  description: "This is a test fixture exemplifying an Enum schema from OCF",
  type: "string",
  enum: ["test_enum1"],
};

describe("File", () => {
  describe("#markdownOutput", () => {
    it("returns a string representing the node as Markdown", () => {
      const schema = new Schema([
        BASE_OBJECT_SCHEMA_NODE_FIXTURE,
        OBJECT_SCHEMA_NODE_FIXTURE,
        ENUM_FILE_TYPE_SCHEMA_NODE_FIXTURE,
        ENUM_SCHEMA_NODE_FIXTURE,
        BASE_FILE_SCHEMA_NODE_FIXTURE,
        FILE_FIXTURE,
      ]);
      const actual = new File(schema, FILE_FIXTURE).markdownOutput();
      let copyright_year = new Date().getFullYear();

      expect(actual).toEqual(`### Test Title

\`https://raw.githubusercontent.com/Open-Cap-Table-Coalition/Open-Cap-Format-OCF/main/schema/files/TestFile.schema.json\`

**Description:** _This is a test fixture exemplifying a File schema from OCF_

**Data Type:** \`OCF_TEST_FILE\`

**Composed From:**

- [schema/primitives/files/File](../primitives/files/File.md)

**Properties:**

| Property  | Type                                                                                         | Description                | Required |
| --------- | -------------------------------------------------------------------------------------------- | -------------------------- | -------- |
| file_type | **Constant:** \`OCF_TEST_FILE\`</br>_Defined in [schema/enums/FileType](../enums/FileType.md)_ | Object type field          | -        |
| items     | [ [schema/objects/Valuation](../objects/Valuation.md) ]                                      | Example ref array property | -        |

**Source Code:** [schema/files/TestFile](../../../../schema/files/TestFile.schema.json)

Copyright © ${copyright_year} Open Cap Table Coalition.
`);
    });
  });
});
