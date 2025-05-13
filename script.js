"use strict";

// TODO support line wrapping (space-seperated, keys-values etc)
class Format {
  /**
   * @param {Object} param0
   * @param {string[]} param0.values
   * @returns {string}
   */
  static sepSpace({ values }) {
    return values.join(" ");
  }

  /**
   * @param {Object} param0
   * @param {string} param0.host
   * @param {string?} [param0.container]
   * @param {string[]} [param0.permissions]
   * @returns {string}
   */
  static mapping({ host, container = null, permissions = [] }) {
    // Remove duplicates
    permissions = [...new Set(permissions)];

    permissions = permissions.length > 0 ? `:${permissions.join("")}` : "";
    container = container !== null ? `:${container}` : permissions.length > 0 ? `:${host}` : "";
    return `${host}${container}${permissions}`;
  }

  /**
   * @param {Object} param0
   * @param {string} param0.hostname
   * @param {string} param0.ip
   * @returns {string}
   */
  static hostMapping({ hostname, ip }) {
    return `${hostname}:${ip}`;
  }

  /**
   * @param {Object} param0
   * @param {Object<string, string>} param0.values
   */
  static keyVal({ values }) {
    for (const [key, value] in Object.entries(values)) {
    }
  }
}

const options = {
  container: {
    AddCapability: {
      name: "cap-add",
      allowMultiple: true,
      format: Format.sepSpace,
      params: [
        {
          param: "values",
          name: "Capabilities",
          type: "literal",
          isArray: true,
          options: [
            "CAP_AUDIT_CONTROL",
            "CAP_AUDIT_READ",
            "CAP_AUDIT_WRITE",
            "CAP_BLOCK_SUSPEND",
            "CAP_BPF",
            "CAP_CHECKPOINT_RESTORE",
            "CAP_SYS_ADMIN",
            "CAP_CHOWN",
            "CAP_DAC_OVERRIDE",
            "CAP_DAC_READ_SEARCH",
            "CAP_FOWNER",
            "CAP_DAC_READ_SEARCH",
            "CAP_FSETID",
            "CAP_IPC_LOCK",
            "CAP_IPC_OWNER",
            "CAP_KILL",
            "CAP_LEASE",
            "CAP_LINUX_IMMUTABLE",
            "CAP_MAC_ADMIN",
            "CAP_MAC_OVERRIDE",
            "CAP_MKNOD",
            "CAP_NET_ADMIN",
            "CAP_NET_BIND_SERVICE",
            "CAP_NET_BROADCAST",
            "CAP_NET_RAW",
            "CAP_PERFMON",
            "CAP_SYS_ADMIN",
            "CAP_SETGID",
            "CAP_SETFCAP",
            "CAP_SETPCAP",
            "CAP_SETPCAP",
            "CAP_SETUID",
            "CAP_SYS_ADMIN",
            "CAP_BPF",
            "CAP_SYS_BOOT",
            "CAP_SYS_CHROOT",
            "CAP_SYS_MODULE",
            "CAP_SYS_NICE",
            "CAP_SYS_PACCT",
            "CAP_SYS_PTRACE",
            "CAP_SYS_RAWIO",
            "CAP_SYS_RESOURCE",
            "CAP_SYS_TIME",
            "CAP_SYS_TTY_CONFIG",
            "CAP_SYSLOG",
            "CAP_WAKE_ALARM",
          ],
        },
      ],
    },
    AddDevice: {
      name: "device",
      allowMultiple: true,
      format: Format.mapping,
      params: [
        {
          param: "host",
          name: "Host device",
          type: "path",
        },
        {
          param: "container",
          name: "Container device",
          type: "path",
          isOptional: true,
        },
        {
          param: "permissions",
          name: "Permissions",
          type: "literal",
          isArray: true,
          isOptional: true,
          options: ["r", "w", "m"],
        },
      ],
    },
    AddHost: {
      name: "add-host",
      allowMultiple: true,
      format: Format.hostMapping,
      params: [
        {
          param: "hostname",
          name: "Hostname",
          type: "string",
        },
        {
          param: "ip",
          name: "IP Address",
          type: "string",
        },
      ],
    },
    Image: {
      name: "image",
      format: ({ name }) => name,
      params: [
        {
          param: "name",
          name: "Name",
          type: "string",
        },
      ],
    },
  },
};

/**
 * @param {HTMLFieldSetElement} element
 * @param {string} option
 * @param {Object} param
 * @param {boolean} [isArray]
 * @returns {HTMLInputElement}
 */
function addInput(element, option, param, isArray = false) {
  const input = document.createElement("input");
  input.type = "text";
  input.className = "value";
  input.name = `${option}.${param.param}`;

  if (isArray) input.name += `[${element.childElementCount}]`;

  element.appendChild(input);
  return input;
}

/**
 * @param {HTMLFieldSetElement} element
 * @param {string} option
 * @param {Object} param
 * @param {boolean} [isArray]
 * @returns {HTMLSelectElement}
 */
function addSelect(element, option, param, isArray = false) {
  const select = document.createElement("select");
  select.className = "value";
  select.name = `${option}.${param.param}`;

  if (isArray) select.name += `[${element.childElementCount}]`;

  for (const opt of param.options) {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  }

  element.appendChild(select);
  return select;
}

/**
 * @param {string} option
 * @param {bool} [isRemovable]
 * @returns {HTMLFieldSetElement}
 */
function generateOption(option, isRemovable = true) {
  const objectName = Object.keys(options.container).find(
    (key) => options.container[key].name === option
  );
  const context = options.container[objectName];

  if (!context.allowMultiple) {
    document
      .getElementById("select-option")
      .querySelector(`option[value=${option}]`).disabled = true;
  }

  const fieldset = document.createElement("fieldset");
  fieldset.className = "option";
  fieldset.name = option;

  const legend = document.createElement("legend");
  legend.textContent = objectName;

  if (isRemovable) {
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.onclick = function () {
      this.parentElement.parentElement.remove();
    };
    legend.appendChild(remove);
  }

  fieldset.appendChild(legend);

  for (const param of context.params) {
    const div = document.createElement("div");
    div.className = "param";

    // Up to 8.2 trillion fields (36^8)
    let id;
    while (true) {
      id = Math.random().toString(36).substring(2, 10);
      if (!document.getElementById(id)) break;
    }

    const label = document.createElement("label");
    label.className = "field";
    label.htmlFor = id;
    label.textContent = param.name;

    if (!param.isOptional) {
      const span = document.createElement("span");
      span.style.color = "red";
      span.textContent = "*";

      label.appendChild(span);
    }

    div.appendChild(label);

    const func = {
      path: addInput,
      string: addInput,
      literal: addSelect,
    }[param.type];

    if (!param.isArray) {
      fieldset.appendChild(div);

      // Add input element to end
      const element = func(div, option, param);
      element.id = id;
      // Selects don't need required=true
      if (!param.isOptional && param.type !== "literal") element.required = true;
      continue;
    }

    const values = document.createElement("div");
    values.className = "values";
    div.appendChild(values);

    // Optional selects don't get labelled id for first option
    if (!(param.isOptional && param.type === "literal")) func(values, option, param, true).id = id;

    // + and - buttons
    const more = document.createElement("button");
    more.type = "button";
    more.className = "more";
    more.textContent = "+";
    more.onclick = () => func(values, option, param, true);

    const less = document.createElement("button");
    less.type = "button";
    less.className = "less";
    less.textContent = "-";
    // Remove last input but always leave one when required
    less.onclick = () => {
      if (values.childElementCount > (param.isOptional ? 0 : 1)) values.lastElementChild.remove();
    };

    div.appendChild(more);
    div.appendChild(less);

    fieldset.appendChild(div);
  }

  return fieldset;
}

/**
 * @param {FormData} formData
 * @returns {object}
 */
function parseFormData(formData) {
  const result = {};

  let prevOption;
  let prevField;
  let currentParams = {};
  let currentArray = [];
  for (const [key, value] of formData.entries()) {
    // Assuming valid data
    const [option, reference] = key.split(".");
    const isArray = key.endsWith("]");
    const field = isArray ? reference.substring(0, reference.indexOf("[")) : reference;
    const arrayIndex = isArray
      ? Number(key.substring(key.indexOf("[") + 1, key.indexOf("]")))
      : null;

    // Next option
    if (option !== prevOption) {
      // Add current array
      if (currentArray.length !== 0) {
        currentParams[prevField] = currentArray;
        currentArray = [];
      }

      // Add all params
      if (prevOption !== undefined) (result[prevOption] ??= []).push(currentParams);
      currentParams = {};
      prevOption = option;
    }

    if (isArray) {
      // Next option with same name (when inconsistent index)
      if (
        (arrayIndex !== currentArray.length || field !== prevField) &&
        currentArray.length !== 0
      ) {
        currentParams[prevField] = currentArray;
        (result[prevOption] ??= []).push(currentParams);

        currentParams = {};
        currentArray = [];
      }

      currentArray.push(value);
      prevField = field;
      continue;
    }

    // Add previous array
    if (currentArray.length !== 0) {
      currentParams[prevField] = currentArray;
      currentArray = [];
    }

    // Next option (double field)
    if (field in currentParams) {
      currentParams[prevField] = value;
      (result[prevOption] ??= []).push(currentParams);
      currentParams = {};
    }

    if (value !== "") currentParams[field] = value;

    prevField = field;
  }

  // Last option
  if (currentArray.length !== 0) {
    currentParams[prevField] = currentArray;
    currentArray = [];
  }
  (result[prevOption] ??= []).push(currentParams);

  return result;
}

/**
 * @param {object} data
 * @returns {string}
 */
function generateQuadlet(data) {
  let result = [];

  for (const [name, content] of Object.entries(data)) {
    for (const value of content) {
      const objectName = Object.keys(options.container).find(
        (key) => options.container[key].name === name
      );
      const context = options.container[objectName];
      result.push([objectName, context.format(value)]);
    }
  }

  return result.map(([key, value]) => `${key}=${value}`).join("\n");
}

// Event listener for calling generateOption
document.getElementById("add-option").addEventListener("submit", (event) => {
  event.preventDefault();
  const fieldset = generateOption(document.getElementById("select-option").value);
  document.getElementById("options").appendChild(fieldset);
});

// Event listener for generating quadlet
const form = document.getElementById("generate");
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  document.getElementById("quadlet").textContent = generateQuadlet(parseFormData(data));
});

// Populate options
for (const option in options.container) {
  const element = document.createElement("option");
  element.value = options.container[option].name;
  element.textContent = option;
  document.getElementById("select-option").appendChild(element);
}

// Add image option (required container key)
const fieldset = generateOption("image", false);
document.getElementById("options").appendChild(fieldset);
