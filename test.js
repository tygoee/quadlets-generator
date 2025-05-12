"use strict";

/**
 * @param {Object<string, string>} obj
 * @returns {FormData}
 */
function generateFormData(obj) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(obj)) {
    const index = key.indexOf("/");
    formData.append(index == -1 ? key : key.substring(0, index), value);
  }

  return formData;
}

const formDataAssertions = [
  [{ "device.host": "/dev/device" }, { device: [{ host: "/dev/device" }] }],
  [
    { "device.host": "/dev/device", "device.container": "/dev/device" },
    { device: [{ host: "/dev/device", container: "/dev/device" }] },
  ],
  [
    {
      "device.host": "/dev/device",
      "device.container": "/dev/device",
      "cap-add.dummy": "dummy",
    },
    {
      device: [{ host: "/dev/device", container: "/dev/device" }],
      "cap-add": [{ dummy: "dummy" }],
    },
  ],
  [
    { "cap-add.options[0]": "CAP_NET_BIND_SERVICE" },
    { "cap-add": [{ options: ["CAP_NET_BIND_SERVICE"] }] },
  ],
  [
    { "cap-add.options[0]": "CAP_NET_BIND_SERVICE", "cap-add.dummy": "dummy" },
    { "cap-add": [{ options: ["CAP_NET_BIND_SERVICE"], dummy: "dummy" }] },
  ],
  [
    {
      "cap-add.options[0]": "CAP_NET_BIND_SERVICE",
      "cap-add.options[1]": "CAP_SYSLOG",
    },
    {
      "cap-add": [{ options: ["CAP_NET_BIND_SERVICE", "CAP_SYSLOG"] }],
    },
  ],
  [
    {
      "cap-add.options[0]": "CAP_NET_BIND_SERVICE",
      "cap-add.options[1]": "CAP_SYSLOG",
      "cap-add.dummy": "dummy",
    },
    {
      "cap-add": [
        { options: ["CAP_NET_BIND_SERVICE", "CAP_SYSLOG"], dummy: "dummy" },
      ],
    },
  ],
  [
    {
      "cap-add.options[0]/1": "CAP_NET_BIND_SERVICE",
      "cap-add.options[0]/2": "CAP_SYSLOG",
    },
    {
      "cap-add": [
        { options: ["CAP_NET_BIND_SERVICE"] },
        { options: ["CAP_SYSLOG"] },
      ],
    },
  ],
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
];

for (const assertion of formDataAssertions) {
  [assertion[0], assertion[1]] = [
    JSON.stringify(parseFormData(generateFormData(assertion[0]))),
    JSON.stringify(assertion[1]),
  ];

  console.debug("asserting", assertion[0], "equals", assertion[1]);
  console.assert(assertion[0] == assertion[1], assertion[0], assertion[1]);
}

/* Test script (all files/functions have to be loaded)
const script = document.createElement('script');
script.src = 'test.js';
document.body.appendChild(script);
*/
