"use strict";

// TODO Make this an automated test (Github actions)

// When testing a single test, just comment out the rest for now
/* Test script (all files/functions have to be loaded)
const script = document.createElement('script');
script.src = 'test.js';
document.body.appendChild(script);
*/

/**
 * @param {Object<string, string>} obj
 * @returns {FormData}
 */
function generateFormData(obj) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(obj)) {
    const index = key.indexOf("/");
    formData.append(index === -1 ? key : key.substring(0, index), value);
  }

  return formData;
}

const formDataAssertions = [
  // One option, single
  [
    { "AddDevice.host": "/dev/device" },
    { AddDevice: [{ host: "/dev/device" }] },
  ],
  // One option, multiple
  [
    { "AddDevice.host": "/dev/device", "AddDevice.container": "/dev/device" },
    { AddDevice: [{ host: "/dev/device", container: "/dev/device" }] },
  ],
  // One option, including empty
  [
    { "AddDevice.host": "/dev/device", "AddDevice.container": "" },
    { AddDevice: [{ host: "/dev/device" }] },
  ],
  // Different options, different fields
  [
    {
      "AddDevice.host": "/dev/device",
      "AddDevice.container": "/dev/device",
      "AddHost.hostname": "example.com",
      "AddHost.ip": "192.168.1.0",
    },
    {
      AddDevice: [{ host: "/dev/device", container: "/dev/device" }],
      AddHost: [{ hostname: "example.com", ip: "192.168.1.0" }],
    },
  ],
  // One option, overlapping fields
  [
    { "AddDevice.host/1": "/dev/device", "AddDevice.host/2": "/dev/device" },
    { AddDevice: [{ host: "/dev/device" }, { host: "/dev/device" }] },
  ],
  // One option, overlapping fields, including empty
  [
    { "AddDevice.host/1": "/dev/device", "AddDevice.host/2": "" },
    { AddDevice: [{ host: "/dev/device" }] },
  ],
  // Different options, overlapping fields
  [
    {
      "AddDevice.host/1": "/dev/device",
      "AddDevice.container": "/dev/device",
      "AddDevice.host/2": "/dev/device",
    },
    {
      AddDevice: [
        { host: "/dev/device", container: "/dev/device" },
        { host: "/dev/device" },
      ],
    },
  ],
  // Array, single, one field
  [
    { "AddCapability.options[0]": "CAP_NET_BIND_SERVICE" },
    { AddCapability: [{ options: ["CAP_NET_BIND_SERVICE"] }] },
  ],
  // Array, multiple, one field
  [
    {
      "AddCapability.options[0]": "CAP_NET_BIND_SERVICE",
      "AddCapability.options[1]": "CAP_SYSLOG",
    },
    {
      AddCapability: [{ options: ["CAP_NET_BIND_SERVICE", "CAP_SYSLOG"] }],
    },
  ],
  // Array, single, different fields
  [
    {
      "AddCapability.options[0]": "CAP_NET_BIND_SERVICE",
      "AddCapability.dummy": "dummy",
    },
    { AddCapability: [{ options: ["CAP_NET_BIND_SERVICE"], dummy: "dummy" }] },
  ],
  // Array, multiple, different fields
  [
    {
      "AddCapability.options[0]": "CAP_NET_BIND_SERVICE",
      "AddCapability.options[1]": "CAP_SYSLOG",
      "AddCapability.dummy": "dummy",
    },
    {
      AddCapability: [
        { options: ["CAP_NET_BIND_SERVICE", "CAP_SYSLOG"], dummy: "dummy" },
      ],
    },
  ],
  // Array, overlapping index, one field
  [
    {
      "AddCapability.options[0]/1": "CAP_NET_BIND_SERVICE",
      "AddCapability.options[0]/2": "CAP_SYSLOG",
    },
    {
      AddCapability: [
        { options: ["CAP_NET_BIND_SERVICE"] },
        { options: ["CAP_SYSLOG"] },
      ],
    },
  ],
  // Array, overlapping index, multiple fields
  [
    {
      "AddCapability.options[0]/1": "CAP_NET_BIND_SERVICE",
      "AddCapability.options[0]/2": "CAP_SYSLOG",
      "AddCapability.dummy": "dummy",
    },
    {
      AddCapability: [
        { options: ["CAP_NET_BIND_SERVICE"] },
        { options: ["CAP_SYSLOG"], dummy: "dummy" },
      ],
    },
  ],
  // Array, different options
  [
    {
      "AddCapability.options[0]": "CAP_NET_BIND_SERVICE",
      "AddDevice.host": "/dev/device",
    },
    {
      AddCapability: [{ options: ["CAP_NET_BIND_SERVICE"] }],
      AddDevice: [{ host: "/dev/device" }],
    },
  ],
  // Pair, single, one option
  [
    { "Annotation.values.keys[0]": "A", "Annotation.values.values[0]": "B" },
    { Annotation: [{ values: { A: "B" } }] },
  ],
  // Pair, multiple, one option
  [
    {
      "Annotation.values.keys[0]": "A",
      "Annotation.values.values[0]": "B",
      "Annotation.values.keys[1]": "C",
      "Annotation.values.values[1]": "D",
    },
    { Annotation: [{ values: { A: "B", C: "D" } }] },
  ],
  // Pair, different options
  [
    {
      "Annotation.values.keys[0]": "A",
      "Annotation.values.values[0]": "B",
      "Annotation.values.keys[1]": "C",
      "Annotation.values.values[1]": "D",
      "AddDevice.host": "/dev/device",
    },
    {
      Annotation: [{ values: { A: "B", C: "D" } }],
      AddDevice: [{ host: "/dev/device" }],
    },
  ],
];

const assertions = [
  [Format.sepSpace({ values: ["A"] }), "A"],
  [Format.sepSpace({ values: ["A", "B"] }), "A B"],
  [Format.mapping({ host: "/dev/device" }), "/dev/device"],
  [
    Format.mapping({ host: "/dev/device", container: "/dev/device" }),
    "/dev/device:/dev/device",
  ],
  [
    Format.mapping({
      host: "/dev/device",
      container: "/dev/device",
      permissions: ["r", "w", "m"],
    }),
    "/dev/device:/dev/device:rwm",
  ],
  [
    Format.mapping({ host: "/dev/device", permissions: ["r", "w", "m"] }),
    "/dev/device:rwm",
  ],
  [
    Format.mapping({ host: "/dev/device", permissions: ["r", "w", "r"] }),
    "/dev/device:rw",
  ],
  [Format.pair({ values: { A: "B" } }), "A=B"],
  [Format.pair({ values: { A: "B", C: "D" } }), "A=B C=D"],
  [Format.pair({ values: { A: "B C" } }), '"A=B C"'],
  [Format.pair({ values: { A: "B C", D: "E" } }), '"A=B C" D=E'],

  // One field, arg false
  [
    generatePairs({ AutoUpdate: [{ value: "registry" }] }),
    [["AutoUpdate", "registry"]],
  ],
  // Multiple fields, arg false
  [
    generatePairs({
      AddDevice: [{ host: "/dev/device" }],
      AutoUpdate: [{ value: "registry" }],
    }),
    [
      ["AddDevice", "/dev/device"],
      ["AutoUpdate", "registry"],
    ],
  ],
  // Arg true, default format
  [
    generatePairs({ AddDevice: [{ host: "/dev/device" }] }, true),
    [["device", "/dev/device"]],
  ],
  // Arg true, non-default argFormat
  [
    generatePairs({ AutoUpdate: [{ value: "registry" }] }, true),
    [["label", "io.containers.autoupdate=registry"]],
  ],
  // Arg false, seperable field
  [
    generatePairs({ Annotation: [{ values: { A: "B", C: "D" } }] }),
    [["Annotation", "A=B C=D"]],
  ],
  // Arg true, seperable field
  [
    generatePairs({ Annotation: [{ values: { A: "B", C: "D" } }] }, true),
    [
      ["annotation", "A=B"],
      ["annotation", "C=D"],
    ],
  ],

  // TODO tests for generateQuadlet and generatePodmanRun
];

/**
 * @param {any[]} assertion
 * @returns {void}
 */
function assert([key, value]) {
  [key, value] = [JSON.stringify(key), JSON.stringify(value)];

  console.debug("asserting", key, "equals", value);
  console.assert(key === value, `${key} !== ${value}`);
}

function assertType(key, value) {
  console.assert(
    typeof key === value,
    `typeof ${JSON.stringify(key)} !== ${value}`
  );
}

function testOptions() {
  for (const option of Object.values(options.container)) {
    assertType(option.arg, "string");
    if ("allowMultiple" in option) assertType(option.allowMultiple, "boolean");
    if ("format" in option) assertType(option.format, "function");
    if ("argFormat" in option) assertType(option.argFormat, "function");
    console.assert(
      Array.isArray(option.params),
      `Array.isArray(${JSON.stringify(option.params)}) === false`
    );

    for (const param of option.params) {
      assertType(param.param, "string");
      assertType(param.name, "string");
      assertType(param.type, "string");
      console.assert(
        ["path", "string", "select", "boolean", "pair"].includes(param.type),
        `${param.type} !== path | string | select | boolean | pair`
      );

      if ("isArray" in param) assertType(param.isArray, "boolean");
      if ("isOptional" in param) assertType(param.isOptional, "boolean");

      if (param.type === "select") {
        // select needs options
        console.assert(
          "options" in param && param.options != null,
          `${param.type} === select && ${JSON.stringify(
            param.options
          )} === undefined | null`
        );

        // verify options is object or array
        assertType(param.options, "object");

        // all values have to be strings
        if (Array.isArray(param.options))
          param.options.forEach((option) => assertType(option, "string"));
        else
          for (const [key, value] of Object.entries(param.options)) {
            assertType(key, "string");
            assertType(value, "string");
          }
      }

      if ("default" in param)
        switch (typeof param.default) {
          case "string":
            // has to be select
            console.assert(
              param.type === "select",
              `typeof ${param.default} === string && ${param.type} !=== select`
            );
            break;
          case "boolean":
            // has to be boolean (checkbox)
            console.assert(
              param.type === "boolean",
              `typeof ${param.default} === boolean && ${param.type} !=== boolean`
            );
            break;
          default:
            // when neither string or boolean
            console.error(
              `Assertion failed: ${param.default} !== string | boolean`
            );
        }

      if ("placeholder" in param)
        switch (typeof param.placeholder) {
          case "string":
            // has to be path or string
            console.assert(
              ["path", "string"].includes(param.type),
              `typeof ${param.placeholder} === string && ${param.type} !=== path | string`
            );
            break;
          case "object":
            // has to be pair
            console.assert(
              param.type === "pair",
              `typeof ${param.placeholder} === object && ${param.type} !=== pair`
            );
            // object has to be array
            console.assert(
              Array.isArray(param.placeholder),
              `typeof ${param.placeholder} === object && Array.isArray(${param.placeholder}) === false`
            );
            // array has to be of length 2
            console.assert(
              param.placeholder.length === 2,
              `typeof ${param.placeholder} === object && length ${param.placeholder.length} !== 2`
            );
            // both have to be strings
            param.placeholder.forEach((placeholder) =>
              assertType(placeholder, "string")
            );
            break;
          default:
            console.error(
              `Assertion failed: ${param.placeholder} !== string | object`
            );
        }
    }
  }
}

for (const assertion of formDataAssertions) {
  assertion[0] = parseFormData(generateFormData(assertion[0]));
  assert(assertion);
}

for (const assertion of assertions) assert(assertion);

testOptions();
