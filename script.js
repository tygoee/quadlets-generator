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
    AddCapability: {
      name: "cap-add",
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
    AddDevice: {
      name: "device",
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
 * @param {Object} param
 * @param {HTMLButtonElement?} [before]
 * @returns {void}
 */
function addInput(element, param, before = null) {
  const input = document.createElement("input");
  input.name = param.name;
  input.type = "text";

  if (before == null) {
    element.appendChild(input);
    return;
  }

  element.insertBefore(input, before);
}

/**
 * @param {HTMLFieldSetElement} element
 * @param {Object} param
 * @param {HTMLButtonElement?} [before]
 * @returns {void}
 */
function addSelect(element, param, before) {
  const select = document.createElement("select");
  select.name = param.param;

  for (const opt of param.options) {
    const option = document.createElement("option");
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  }

  if (!before) {
    element.appendChild(select);
    return;
  }

  element.insertBefore(select, before);
}

/**
 * @param {string} option
 * @returns {void}
 */
function addOption(option) {
  const context = options.container[option];

  const fieldset = document.createElement("fieldset");
  const legend = document.createElement("legend");
  legend.textContent = option;

  const remove = document.createElement("button");
  remove.textContent = "Remove";
  remove.onclick = function () {
    this.parentElement.parentElement.remove();
  };

  legend.appendChild(remove);
  fieldset.appendChild(legend);

  for (const param of context.params) {
    const div = document.createElement("div");

    const label = document.createElement("label");
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

    // Add input element to end
    if (!(param.isOptional && param.type == "literal")) func(div, param);

    if (!param.isArray) {
      fieldset.appendChild(div);
      continue;
    }

    // + and - buttons
    const more = document.createElement("button");
    more.className = "more";
    more.textContent = "+";
    more.onclick = function () {
      func(this.parentElement, param, this);
    };

    const inputs = ["INPUT", "SELECT"];
    function nthPreviousSibling(element, amount) {
      while (element && amount-- > 0) {
        element = element.previousElementSibling;
      }
      return element;
    }

    const less = document.createElement("button");
    less.className = "less";
    less.textContent = "-";
    less.onclick = function () {
      // Remove last input but always leave one when required
      const amount = param.isOptional ? 2 : 3;

      if (inputs.includes(nthPreviousSibling(this, amount).tagName))
        nthPreviousSibling(this, 2).remove();
    };

    div.appendChild(more);
    div.appendChild(less);

    fieldset.appendChild(div);
  }

  document.getElementById("content").appendChild(fieldset);
}

// Event listener for calling addOption
document.getElementById("add-option").addEventListener("submit", (event) => {
  event.preventDefault();
  addOption(document.getElementById("option").value);

  // TODO Gray out option when taken and multiple is false
});

// Populate options
for (option in options.container) {
  const element = document.createElement("option");
  element.value = option;
  element.textContent = option;
  document.getElementById("option").appendChild(element);
}
