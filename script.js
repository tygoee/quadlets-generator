"use strict";

/**
 * @param {HTMLFieldSetElement} element
 * @param {string} option
 * @param {Object} param
 * @param {boolean} isArray
 * @param {Object<string, string>} attributes
 * @returns {HTMLInputElement}
 */
function addInput(element, option, param, isArray = false, attributes = {}) {
  const input = document.createElement("input");
  input.className = "value";
  input.name = `${option}.${param.param}`;
  input.type = "text";
  input.required = !param.isOptional;
  for (const [name, value] of Object.entries(attributes)) {
    input.setAttribute(name, value);
  }

  if (isArray) input.name += `[${element.childElementCount}]`;

  element.appendChild(input);
  return input;
}

/**
 * @param {HTMLFieldSetElement} element
 * @param {string} option
 * @param {Object} param
 * @param {boolean} isArray
 * @param {Object<string, string>} attributes
 * @returns {HTMLSelectElement}
 */
function addSelect(element, option, param, isArray = false, attributes = {}) {
  const select = document.createElement("select");
  select.className = "value";
  select.name = `${option}.${param.param}`;
  for (const [name, value] of Object.entries(attributes)) {
    select.setAttribute(name, value);
  }

  if (isArray) select.name += `[${element.childElementCount}]`;

  const optionsIsArray = Array.isArray(param.options);
  for (const opt of optionsIsArray ? param.options : Object.keys(param.options)) {
    const option = document.createElement("option");
    option.value = opt;
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
 * @param {boolean} isArray
 * @param {Object<string, string>} attributes
 * @returns {HTMLInputElement}
 */
function addBoolean(element, option, param, isArray = false, attributes = {}) {
  const input = document.createElement("input");
  input.className = "value";
  input.name = `${option}.${param.param}`;
  input.type = "checkbox";
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
 * @param {boolean} isArray
 * @param {Object<string, string>} attributes
 * @returns {HTMLDivElement}
 */
function addPair(element, option, param, isArray = false, attributes = {}) {
  const div = document.createElement("div");
  div.className = "pair";

  const key = document.createElement("input");
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

    if (!param.isArray) {
      fieldset.appendChild(div);

      // Add input element to end
      func(div, option, param, false, { id: id });
      continue;
    }

    const values = document.createElement("div");
    values.className = "values";
    div.appendChild(values);

    // Optional selects don't need first option
    if (!(param.isOptional && param.type === "select"))
      func(values, option, param, true, { id: id });

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
