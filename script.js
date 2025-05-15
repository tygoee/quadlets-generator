"use strict";

/**
 * @param {HTMLFieldSetElement} element
 * @param {string} option
 * @param {Object} param
 * @param {Object.<string, string>} attributes
 * @returns {HTMLInputElement}
 */
function addInput(element, option, param, attributes = {}) {
  const input = document.createElement("input");
  input.className = "value";
  input.name = `${option}.${param.param}`;
  input.type = "text";
  input.required = !param.isOptional;
  if (param.placeholder) input.placeholder = param.placeholder;
  for (const [name, value] of Object.entries(attributes)) {
    input.setAttribute(name, value);
  }

  if (param.isArray) input.name += `[${element.childElementCount}]`;

  element.appendChild(input);
  return input;
}

/**
 * @param {HTMLFieldSetElement} element
 * @param {string} option
 * @param {Object} param
 * @param {Object.<string, string>} attributes
 * @returns {HTMLSelectElement}
 */
function addSelect(element, option, param, attributes = {}) {
  const select = document.createElement("select");
  select.className = "value";
  select.name = `${option}.${param.param}`;
  select.required = param.isArray || !param.isOptional;
  for (const [name, value] of Object.entries(attributes)) {
    select.setAttribute(name, value);
  }

  if (param.isArray) select.name += `[${element.childElementCount}]`;

  // Add empty option
  if (!param.default) {
    const option = document.createElement("option");
    option.value = "";
    option.selected = true;
    option.disabled = param.isArray || !param.isOptional;
    select.appendChild(option);
  }

  const optionsIsArray = Array.isArray(param.options);
  for (const opt of optionsIsArray
    ? param.options
    : Object.keys(param.options)) {
    const option = document.createElement("option");
    option.value = opt;
    option.selected = param.default === opt;
    option.textContent = optionsIsArray ? opt : param.options[opt];
    select.appendChild(option);
  }

  element.appendChild(select);
  return select;
}

/**
 * @param {HTMLFieldSetElement} element
 * @param {string} option
 * @param {Object} param
 * @param {Object.<string, string>} attributes
 * @returns {HTMLInputElement}
 */
function addBoolean(element, option, param, attributes = {}) {
  const input = document.createElement("input");
  input.className = "value";
  input.name = `${option}.${param.param}`;
  input.type = "checkbox";
  input.checked = param.default;
  for (const [name, value] of Object.entries(attributes)) {
    if (name !== "id") input.setAttribute(name, value);
  }

  element.appendChild(input);
  return input;
}

/**
 * @param {HTMLFieldSetElement} element
 * @param {string} option
 * @param {Object} param
 * @param {Object.<string, string>} attributes
 * @returns {HTMLDivElement}
 */
function addPair(element, option, param, attributes = {}) {
  const div = document.createElement("div");
  div.className = "pair";

  const key = document.createElement("input");
  key.type = "text";
  key.className = "value";
  key.name = `${option}.${param.param}.keys[${element.childElementCount}]`;
  key.required = !param.isOptional;
  if (Array.isArray(param.placeholder)) key.placeholder = param.placeholder[0];

  const span = document.createElement("span");
  span.textContent = "=";

  const value = document.createElement("input");
  value.type = "text";
  value.className = "value";
  value.name = `${option}.${param.param}.values[${element.childElementCount}]`;
  value.required = !param.isOptional;
  if (Array.isArray(param.placeholder))
    value.placeholder = param.placeholder[1];

  for (const [name, attrValue] of Object.entries(attributes)) {
    key.setAttribute(name, attrValue);
    if (name !== "id") value.setAttribute(name, attrValue);
  }

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
  const context = options.container[option];

  if (!context.allowMultiple) {
    document
      .getElementById("select-option")
      .querySelector(`option[value=${option}]`).disabled = true;
  }

  const fieldset = document.createElement("fieldset");
  fieldset.className = "option";
  fieldset.name = option;

  const legend = document.createElement("legend");
  legend.textContent = option;

  if (isRemovable) {
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.onclick = function () {
      this.parentElement.parentElement.remove();
      const selectOption = document
        .getElementById("select-option")
        .querySelector(`option[value=${option}]`);
      if (selectOption.disabled) {
        selectOption.disabled = false;
      }
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

    if (!param.isOptional && param.type !== "boolean") {
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
      boolean: addBoolean,
      pair: addPair,
    }[param.type];

    /**
     * @param {HTMLFieldSetElement} element
     * @param {string} option
     * @param {Object} param
     * @param {Object.<string, string>} attributes
     * @returns {HTMLElement}
     */
    const add = (element, option, param, attributes) => {
      // Remove "display: none"
      if (element.style.display === "none")
        element.style.removeProperty("display");

      return func(element, option, param, attributes);
    };

    if (!param.isArray) {
      fieldset.appendChild(div);

      // Add input element to end
      add(div, option, param, { id: id });
      continue;
    }

    const values = document.createElement("div");
    values.className = "values";
    div.appendChild(values);

    // Optional selects don't need first option
    if (param.isOptional && param.type === "select")
      values.style.display = "none"; // Remove flex gap
    else add(values, option, param, { id: id });

    // + and - buttons
    const more = document.createElement("button");
    more.type = "button";
    more.className = "more";
    more.textContent = "+";
    more.onclick = () => add(values, option, param);

    const less = document.createElement("button");
    less.type = "button";
    less.className = "less";
    less.textContent = "-";
    // Remove last input but always leave one when required
    less.onclick = () => {
      if (values.childElementCount > (param.isOptional ? 0 : 1))
        values.lastElementChild.remove();

      // Add "display: none" to remove flex gap
      if (values.childElementCount === 0) values.style.display = "none";
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
  for (const [name, value] of formData.entries()) {
    // Empty option
    if (name == "submit" || value === "") continue;

    // Assuming valid data
    let values = name.split(".");
    if (values[0] === "submit") continue;
    const isArray = name.endsWith("]");
    const index = values.length - 1;
    if (isArray)
      values[index] = values[index].substring(0, values[index].indexOf("["));
    const [option, field, type] = values;
    const arrayIndex = isArray
      ? Number(name.substring(name.indexOf("[") + 1, name.indexOf("]")))
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
 * @param {Object.<string, Object[]>} data
 * @param {boolean} arg
 * @returns {string[][]}
 */
function generatePairs(data, arg = false) {
  let result = [];

  for (const [name, content] of Object.entries(data)) {
    for (const params of content) {
      if (!arg) {
        const context = options.container[name];
        // Default context.format to {value} => value
        const format = context.format || (({ value }) => value);
        result.push([name, format(params)]);
        continue;
      }

      const context = options.container[name];
      // Try to use argFormat
      const format =
        context.argFormat || context.format || (({ value }) => value);

      // Seperate seperable args
      let addedPair = false;
      for (const [param, value] of Object.entries(params)) {
        // Check if value is object (object = pair)
        if (!(value && typeof value === "object" && !Array.isArray(value)))
          continue;

        addedPair = true;
        for (const [key, val] of Object.entries(value))
          result.push([
            context.arg,
            // Make a shallow copy and overwrite the pair
            format({ ...params, [param]: { [key]: val } }),
          ]);

        // Only one pair param (previous step will fail when multiple)
        break;
      }

      if (!addedPair) result.push([context.arg, format(params)]);
    }
  }

  return result;
}

/**
 * @param {string[][]} data
 * @returns {string}
 */
function generateQuadlet(data) {
  // TODO ini sections and description/name etc
  return data.map(([key, value]) => `${key}=${value}`).join("\n");
}

/**
 * @param {string[][]} data
 * @returns {string}
 */
function generatePodmanRun(data) {
  // TODO (!) fix arguments with spaces and other characters
  let globalArgs = [];
  let args = [];
  let image, exec;
  for (let [key, value] of data) {
    switch (key) {
      case "image":
        image = value;
        break;
      case "exec":
        exec = value;
        break;
      case "module":
        globalArgs.push(value);
        break;
      default:
        args.push(`--${key} ${value}`);
    }
  }

  return ["podman", ...globalArgs, "run", ...args, image, exec]
    .filter(Boolean)
    .join(" ");
}

// Event listener for calling generateOption
document.getElementById("add-option").addEventListener("submit", (event) => {
  event.preventDefault();
  const fieldset = generateOption(
    document.getElementById("select-option").value
  );
  document.getElementById("options").appendChild(fieldset);
});

// Event listener for generating output
const form = document.getElementById("generate");
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form, event.submitter);
  const output =
    formData.get("submit") === "quadlet"
      ? generateQuadlet(generatePairs(parseFormData(formData)))
      : formData.get("submit") === "podman-run"
      ? generatePodmanRun(generatePairs(parseFormData(formData), true))
      : "";

  document.getElementById("quadlet").textContent = output;
});

// Populate options
for (const option in options.container) {
  const element = document.createElement("option");
  element.value = option;
  element.textContent = option;
  document.getElementById("select-option").appendChild(element);
}

// Add image option (required container key)
const fieldset = generateOption("Image", false);
document.getElementById("options").appendChild(fieldset);
