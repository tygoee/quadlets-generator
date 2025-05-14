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
  [Format.none({ value: "A" }), "A"],
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
function assert(assertion) {
  [assertion[0], assertion[1]] = [
    JSON.stringify(assertion[0]),
    JSON.stringify(assertion[1]),
  ];

  console.debug("asserting", assertion[0], "equals", assertion[1]);
  console.assert(
    assertion[0] === assertion[1],
    assertion[0],
    "equals",
    assertion[1]
  );
}

for (const assertion of formDataAssertions) {
  assertion[0] = parseFormData(generateFormData(assertion[0]));
  assert(assertion);
}

for (const assertion of assertions) assert(assertion);
