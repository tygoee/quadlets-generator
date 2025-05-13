"use strict";

// TODO Make this an automated test (Github actions)
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
  [{ "device.host": "/dev/device" }, { device: [{ host: "/dev/device" }] }],
  // One option, multiple
  [
    { "device.host": "/dev/device", "device.container": "/dev/device" },
    { device: [{ host: "/dev/device", container: "/dev/device" }] },
  ],
  // One option, including empty
  [{ "device.host": "/dev/device", "device.container": "" }, { device: [{ host: "/dev/device" }] }],
  // Different options, different fields
  [
    {
      "device.host": "/dev/device",
      "device.container": "/dev/device",
      "add-host.hostname": "example.com",
      "add-host.ip": "192.168.1.0",
    },
    {
      device: [{ host: "/dev/device", container: "/dev/device" }],
      "add-host": [{ hostname: "example.com", ip: "192.168.1.0" }],
    },
  ],
  // One option, overlapping fields
  [
    { "device.host/1": "/dev/device", "device.host/2": "/dev/device" },
    { device: [{ host: "/dev/device" }, { host: "/dev/device" }] },
  ],
  // One option, overlapping fields, including empty
  [{ "device.host/1": "/dev/device", "device.host/2": "" }, { device: [{ host: "/dev/device" }] }],
  // Different options, overlapping fields
  [
    {
      "device.host/1": "/dev/device",
      "device.container": "/dev/device",
      "device.host/2": "/dev/device",
    },
    { device: [{ host: "/dev/device", container: "/dev/device" }, { host: "/dev/device" }] },
  ],
  // Array, single, one field
  [
    { "cap-add.options[0]": "CAP_NET_BIND_SERVICE" },
    { "cap-add": [{ options: ["CAP_NET_BIND_SERVICE"] }] },
  ],
  // Array, multiple, one field
  [
    {
      "cap-add.options[0]": "CAP_NET_BIND_SERVICE",
      "cap-add.options[1]": "CAP_SYSLOG",
    },
    {
      "cap-add": [{ options: ["CAP_NET_BIND_SERVICE", "CAP_SYSLOG"] }],
    },
  ],
  // Array, single, different fields
  [
    { "cap-add.options[0]": "CAP_NET_BIND_SERVICE", "cap-add.dummy": "dummy" },
    { "cap-add": [{ options: ["CAP_NET_BIND_SERVICE"], dummy: "dummy" }] },
  ],
  // Array, multiple, different fields
  [
    {
      "cap-add.options[0]": "CAP_NET_BIND_SERVICE",
      "cap-add.options[1]": "CAP_SYSLOG",
      "cap-add.dummy": "dummy",
    },
    {
      "cap-add": [{ options: ["CAP_NET_BIND_SERVICE", "CAP_SYSLOG"], dummy: "dummy" }],
    },
  ],
  // Array, overlapping index, one field
  [
    {
      "cap-add.options[0]/1": "CAP_NET_BIND_SERVICE",
      "cap-add.options[0]/2": "CAP_SYSLOG",
    },
    {
      "cap-add": [{ options: ["CAP_NET_BIND_SERVICE"] }, { options: ["CAP_SYSLOG"] }],
    },
  ],
  // Array, overlapping index, multiple fields
  [
    {
      "cap-add.options[0]/1": "CAP_NET_BIND_SERVICE",
      "cap-add.options[0]/2": "CAP_SYSLOG",
      "cap-add.dummy": "dummy",
    },
    {
      "cap-add": [
        { options: ["CAP_NET_BIND_SERVICE"] },
        { options: ["CAP_SYSLOG"], dummy: "dummy" },
      ],
    },
  ],
  // Array, different options
  [
    {
      "cap-add.options[0]": "CAP_NET_BIND_SERVICE",
      "device.host": "/dev/device",
    },
    {
      "cap-add": [{ options: ["CAP_NET_BIND_SERVICE"] }],
      device: [{ host: "/dev/device" }],
    },
  ],
  // Pair, single, one option
  [
    { "annotation.values.keys[0]": "A", "annotation.values.values[0]": "B" },
    { annotation: [{ values: { A: "B" } }] },
  ],
  // Pair, multiple, one option
  [
    {
      "annotation.values.keys[0]": "A",
      "annotation.values.values[0]": "B",
      "annotation.values.keys[1]": "C",
      "annotation.values.values[1]": "D",
    },
    { annotation: [{ values: { A: "B", C: "D" } }] },
  ],
  // Pair, different options
  [
    {
      "annotation.values.keys[0]": "A",
      "annotation.values.values[0]": "B",
      "annotation.values.keys[1]": "C",
      "annotation.values.values[1]": "D",
      "device.host": "/dev/device",
    },
    { annotation: [{ values: { A: "B", C: "D" } }], device: [{ host: "/dev/device" }] },
  ],
];

const formatAssertions = [
  [Format.sepSpace({ values: ["A"] }), "A"],
  [Format.sepSpace({ values: ["A", "B"] }), "A B"],
  [Format.mapping({ host: "/dev/device" }), "/dev/device"],
  [Format.mapping({ host: "/dev/device", container: "/dev/device" }), "/dev/device:/dev/device"],
  [
    Format.mapping({ host: "/dev/device", container: "/dev/device", permissions: ["r", "w", "m"] }),
    "/dev/device:/dev/device:rwm",
  ],
  [
    Format.mapping({ host: "/dev/device", permissions: ["r", "w", "m"] }),
    "/dev/device:/dev/device:rwm",
  ],
  [
    Format.mapping({ host: "/dev/device", permissions: ["r", "w", "r"] }),
    "/dev/device:/dev/device:rw",
  ],
  [Format.pair({ values: { A: "B" } }), "A=B"],
  [Format.pair({ values: { A: "B", C: "D" } }), "A=B C=D"],
  [Format.pair({ values: { A: "B C" } }), '"A=B C"'],
  [Format.pair({ values: { A: "B C", D: "E" } }), '"A=B C" D=E'],
];

for (const assertion of formDataAssertions) {
  [assertion[0], assertion[1]] = [
    JSON.stringify(parseFormData(generateFormData(assertion[0]))),
    JSON.stringify(assertion[1]),
  ];

  console.debug("asserting", assertion[0], "equals", assertion[1]);
  console.assert(assertion[0] === assertion[1], assertion[0], "equals", assertion[1]);
}

for (const assertion of formatAssertions) {
  console.debug("asserting", assertion[0], "equals", assertion[1]);
  console.assert(assertion[0] === assertion[1], assertion[0], "equals", assertion[1]);
}
