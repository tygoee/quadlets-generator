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
  arg: string (podman-run arg, not unique!)
  allowMultiple?: bool
  format?: function (defaults to {value} => value)
  argFormat?: function (format for podman-run, if different)
  params: param[]

-- param (format function parameters)
param:
  param: string
  name: string (pretty name)
  type: [path string select boolean pair] (max 1 pair!)
  default?: string (select) | bool (when type=boolean, default false)
  placeholder?: string (type=path|string), string[] (type=pair)
  isArray?: bool
  isOptional?: bool (always true when type=boolean)

  when type == select:
  -> options: option[] | object<name, option>
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
          placeholder: "/dev/device",
        },
        {
          param: "container",
          name: "Container device",
          type: "path",
          placeholder: "/dev/device",
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
          placeholder: "example.com",
        },
        {
          param: "ip",
          name: "IP Address",
          type: "string",
          placeholder: "192.168.1.0",
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
          placeholder: ["annotation", "value"],
          isArray: true,
        },
      ],
    },
    AutoUpdate: {
      arg: "label",
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
    CgroupsMode: {
      arg: "cgroups",
      params: [
        {
          param: "value",
          name: "Mode",
          type: "select",
          default: "split",
          options: ["enabled", "split", "no-conmon", "disabled"],
        },
      ],
    },
    ContainerName: {
      arg: "name",
      params: [
        {
          param: "value",
          name: "Name",
          type: "string",
          placeholder: "systemd-%N",
        },
      ],
    },
    ContainersConfModule: {
      arg: "module", // before podman run
      allowMultiple: true,
      params: [
        {
          param: "value",
          name: "Path",
          type: "path",
          placeholder: "containers.conf",
        },
      ],
    },
    Exec: {
      arg: "exec", // no arg, placed after image
      params: [
        {
          param: "value",
          name: "Arguments",
          type: "string",
          placeholder: "--option value",
        },
      ],
    },
    Image: {
      arg: "image", // no arg, placed at end of command
      params: [
        {
          param: "value",
          name: "Name / FQIN",
          type: "string",
          placeholder: "docker.io/library/nginx:latest",
        },
      ],
    },
  },
};
