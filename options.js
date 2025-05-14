"use strict";

// TODO support line wrapping (space-seperated, keys-values etc)
class Format {
  /**
   * @param {Object} param0
   * @param {string} param0.value
   */
  static none({ value }) {
    return value;
  }

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
  static mapping({
    host,
    container = null,
    permissions = [],
    ifExists = false,
  }) {
    // Remove duplicates
    permissions = [...new Set(permissions)];

    permissions = permissions.length > 0 ? `:${permissions.join("")}` : "";
    container = container !== null ? `:${container}` : "";
    return `${ifExists ? "-" : ""}${host}${container}${permissions}`;
  }

  /**
   * @param {Object} param0
   * @param {Object<string, string>} param0.values
   */
  static pair({ values }) {
    return Object.entries(values)
      .map(([key, value]) =>
        value.includes(" ") ? `"${key}=${value}"` : `${key}=${value}`
      )
      .join(" ");
  }
}

/*
-- options
options:
  [container volume network build pod kube]:
    option: (quadlet name)

-- option
option:
  arg: string (podman-run arg)
  allowMultiple?: bool
  format: function
  argFormat?: function (format for podman-run, if different)
  params: array[param]

-- param (format function parameters)
param:
  param: string
  name: string (pretty name)
  type: [path string select boolean pair] (max 1 pair!)
  isArray?: bool
  isOptional?: bool
  -> options: array[option] | object[name, option]
*/
const options = {
  container: {
    AddCapability: {
      arg: "cap-add",
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
      arg: "device",
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
          options: { r: "read", w: "write", m: "mknod" },
        },
        {
          param: "ifExists",
          name: "Only if device exists",
          type: "boolean",
        },
      ],
    },
    AddHost: {
      arg: "add-host",
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
      arg: "annotation",
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
    AutoUpdate: {
      arg: "label",
      format: Format.none,
      argFormat: ({ value }) => `io.containers.autoupdate=${value}`,
      params: [
        {
          param: "value",
          name: "Value",
          type: "select",
          options: ["registry", "local"],
        },
      ],
    },
    Image: {
      arg: "image",
      format: Format.none,
      params: [
        {
          param: "value",
          name: "Name / FQIN",
          type: "string",
        },
      ],
    },
  },
};
