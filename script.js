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
   * @param {string} [param0.container]
   * @param {string[]} param0.permissions
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
   * @param {Object<string, string>} param0.values
   */
  static pair({ values }) {
    return Object.entries(values)
      .map(([key, value]) => (value.includes(" ") ? `"${key}=${value}"` : `${key}=${value}`))
      .join(" ");
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
          type: "select",
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
          type: "select",
          isArray: true,
          isOptional: true,
          options: ["r", "w", "m"],
        },
      ],
    },
    AddHost: {
      name: "add-host",
      allowMultiple: true,
      format: ({ hostname, ip }) => `${hostname}:${ip}`,
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
    Annotation: {
      name: "annotation",
      allowMultiple: true,
      format: Format.pair,
      params: [
        {
          param: "values",
          name: "Annotations",
          type: "pair",
          isArray: true,
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
 * @param {boolean} isArray
 * @param {string} [id]
 * @returns {HTMLInputElement}
 */
function addInput(element, option, param, isArray = false, id = null) {
  const input = document.createElement("input");
  if (id) input.id = id;
  input.className = "value";
  input.name = `${option}.${param.param}`;
  input.type = "text";
  input.required = !param.isOptional;

  if (isArray) input.name += `[${element.childElementCount}]`;

  element.appendChild(input);
  return input;
}

/**
 * @param {HTMLFieldSetElement} element
 * @param {string} option
 * @param {Object} param
 * @param {boolean} isArray
 * @param {string} [id]
 * @returns {HTMLSelectElement}
 */
function addSelect(element, option, param, isArray = false, id = null) {
  const select = document.createElement("select");
  if (id) select.id = id;
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
 * @param {HTMLFieldSetElement} element
 * @param {string} option
 * @param {Object} param
 * @param {boolean} isArray
 * @param {string} [id]
 * @returns {HTMLDivElement}
 */
function addPair(element, option, param, isArray = false, id = null) {
  const div = document.createElement("div");
  div.className = "pair";

  const key = document.createElement("input");
  if (id) key.id = id;
  key.className = "value";
  key.name = `${option}.${param.param}.keys[${element.childElementCount}]`;
  key.type = "text";
  key.required = !param.isOptional;

  const span = document.createElement("span");
  span.textContent = "=";

  const value = document.createElement("input");
  value.className = "value";
  value.name = `${option}.${param.param}.values[${element.childElementCount}]`;
  value.type = "text";
  value.required = !param.isOptional;

  div.appendChild(key);
  div.appendChild(span);
  div.appendChild(value);
  element.appendChild(div);
  return div;
}

/**
 * @param {string} option
 * @param {bool} isRemovable
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
      select: addSelect,
      pair: addPair,
    }[param.type];

    if (!param.isArray) {
      fieldset.appendChild(div);

      // Add input element to end
      func(div, option, param, false, id);
      continue;
    }

    const values = document.createElement("div");
    values.className = "values";
    div.appendChild(values);

    // Optional selects don't get labelled id for first option
    if (!(param.isOptional && param.type === "select")) func(values, option, param, true, id);

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

  function updateParams() {
    // Add current array
    if (currentArray.length !== 0) {
      currentParams[prevField] = currentArray;
      currentArray = [];
    }

    // Add current pairs
    if (Object.keys(currentPairs).length !== 0) {
      currentParams[prevField] = currentPairs;
      currentPairs = {};
    }
  }

  function updateResult() {
    // Add params to result
    result[prevOption] ??= [];
    result[prevOption].push(currentParams);
    currentParams = {};
  }

  let prevOption;
  let prevField;
  let prevPairKey;
  let currentParams = {};
  let currentArray = [];
  let currentPairs = {};
  for (const [key, value] of formData.entries()) {
    // Assuming valid data
    let values = key.split(".");
    const isArray = key.endsWith("]");
    const lastIndex = values.length - 1;
    if (isArray) values[lastIndex] = values[lastIndex].substring(0, values[lastIndex].indexOf("["));
    const [option, field, type] = values;
    const arrayIndex = isArray
      ? Number(key.substring(key.indexOf("[") + 1, key.indexOf("]")))
      : null;

    // Next option
    if (option !== prevOption) {
      if (prevOption !== undefined) {
        updateParams();
        updateResult();
      }
      prevOption = option;
    }

    if (isArray) {
      // Next option with same name (when inconsistent index)
      if (
        (arrayIndex !== currentArray.length || field !== prevField) &&
        currentArray.length !== 0
      ) {
        updateParams();
        updateResult();
      }

      // Pair
      if (type === "keys") {
        prevPairKey = value;
      } else if (type === "values") {
        currentPairs[prevPairKey] = value;
      } else {
        currentArray.push(value);
      }

      prevField = field;
      continue;
    }

    updateParams();

    // Empty option
    if (value === "") {
      prevField = field;
      continue;
    }

    // Next option (double field)
    if (field in currentParams) {
      currentParams[prevField] = value;
      updateResult();
    }

    currentParams[field] = value;
    prevField = field;
  }

  // Last option
  updateParams();
  updateResult();

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
