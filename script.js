"use strict";

class Format {
  /**
   * @param {string[]} options
   * @returns {string}
   */
  static sepSpace(options) {
    return options.join(" ");
  }

  /**
   * @param {string} host
   * @param {string?} [container]
   * @param {string[]} [permissions]
   * @returns {string}
   */
  static mapping(host, container = null, permissions = []) {
    permissions = permissions.length == 0 ? "" : `:${permissions.join("")}`;
    container = container == null ? "" : `:${container}`;
    return `${host}${container}${permissions}`;
  }
}

const options = {
  container: {
    "cap-add": {
      name: "AddCapability",
      allowMultiple: true,
      format: Format.sepSpace,
      params: [
        {
          param: "options",
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
    device: {
      name: "AddDevice",
      allowMultiple: true,
      format: Format.mapping,
      params: [
        {
          param: "host",
          name: "Host",
          type: "path",
        },
        {
          param: "container",
          name: "Container",
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
 * @returns {HTMLFieldSetElement}
 */
function generateOption(option) {
  const context = options.container[option];

  const fieldset = document.createElement("fieldset");
  fieldset.className = "option";
  fieldset.name = option;

  const legend = document.createElement("legend");
  legend.textContent = context.name;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.textContent = "Remove";
  remove.onclick = function () {
    this.parentElement.parentElement.remove();
  };

  legend.appendChild(remove);
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
      func(div, option, param).id = id;
      continue;
    }

    const values = document.createElement("div");
    values.className = "values";
    div.appendChild(values);

    // Optional selects don't get labelled id for first option
    if (!(param.isOptional && param.type == "literal")) func(values, option, param, true).id = id;

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

/** @returns {string} */
function generateQuadlet() {
  return "result";
}

// Event listener for calling generateOption
document.getElementById("add-option").addEventListener("submit", (event) => {
  event.preventDefault();
  const fieldset = generateOption(document.getElementById("select-option").value);
  document.getElementById("content").appendChild(fieldset);

  // TODO Gray out option when taken and multiple is false
});

const form = document.getElementById("generate");
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const data = new FormData(form);
  console.log(data);
  document.getElementById("quadlet").textContent = generateQuadlet();
});

// Populate options
for (const option in options.container) {
  const element = document.createElement("option");
  element.value = option;
  element.textContent = options.container[option].name;
  document.getElementById("select-option").appendChild(element);
}
