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
  static mapping({ host, container = null, permissions = [], ifExists = false }) {
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
      .map(([key, value]) => (value.includes(" ") ? `"${key}=${value}"` : `${key}=${value}`))
      .join(" ");
  }
}

/*
-- options
options:
  [container pod kube network volume build image]:
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
  default?: string (type=select) | bool (type=boolean, default false)
  placeholder?: string (type=path|string), string[] (type=pair)
  isArray?: bool
  isOptional?: bool (always ignored (true) when type=boolean)
  condition?: function(option) (return false to disable input)

  when type === select:
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
    DNS: {
      arg: "dns",
      allowMultiple: true,
      params: [
        {
          param: "value",
          name: "IP Address",
          type: "string",
          placeholder: "192.168.0.1",
        },
      ],
    },
    DNSOption: {
      arg: "dns-option",
      allowMultiple: true,
      format: ([option, value]) => (option + value ? `:${value}` : ""),
      params: [
        {
          param: "option",
          name: "Option",
          type: "select",
          options: [
            "debug",
            "ndots",
            "timeout",
            "attempts",
            "rotate",
            "no-aaaa",
            "no-check-names",
            "inet6",
            "ip6-bytestring",
            "ip6-dotint",
            "no-ip6-dotint",
            "edns0",
            "single-request",
            "single-request-reopen",
            "no-tld-query",
            "use-vc",
            "no-reload",
            "trust-ad",
          ],
        },
        {
          param: "value",
          name: "Value",
          type: "string",
          isOptional: true,
          condition: (option) => ["ndots", "timeout", "attempts"].includes(option.option),
        },
      ],
    },
    // DNSSearch: {
    //   arg: "dns-search",
    // },
    // DropCapability: {
    //   arg: "cap-drop",
    // },
    // Entrypoint: {
    //   arg: "entrypoint",
    // },
    // Environment: {
    //   arg: "env",
    // },
    // EnvironmentFile: {
    //   arg: "env-file",
    // },
    // EnvironmentHost: {
    //   arg: "env-host",
    // },
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
    // ExposeHostPort: {
    //   arg: "expose",
    // },
    // GIDMap: {
    //   arg: "gidmap",
    // },
    // GlobalArgs: {
    //   arg: "global-args", // before podman run
    // },
    // Group: {
    //   arg: "user",
    // },
    // GroupAdd: {
    //   arg: "group-add",
    // },
    // HealthCmd: {
    //   arg: "health-cmd",
    // },
    // HealthInterval: {
    //   arg: "health-interval",
    // },
    // HealthLogDestination: {
    //   arg: "health-log-destination",
    // },
    // HealthMaxLogCount: {
    //   arg: "health-max-log-count",
    // },
    // HealthMaxLogSize: {
    //   arg: "health-max-log-size",
    // },
    // HealthOnFailure: {
    //   arg: "health-on-failure",
    // },
    // HealthRetries: {
    //   arg: "health-retries",
    // },
    // HealthStartPeriod: {
    //   arg: "health-start-period",
    // },
    // HealthStartupCmd: {
    //   arg: "health-startup-cmd",
    // },
    // HealthStartupInterval: {
    //   arg: "health-startup-interval",
    // },
    // HealthStartupRetries: {
    //   arg: "health-startup-retries",
    // },
    // HealthStartupSuccess: {
    //   arg: "health-startup-success",
    // },
    // HealthStartupTimeout: {
    //   arg: "health-startup-timeout",
    // },
    // HealthTimeout: {
    //   arg: "health-timeout",
    // },
    // HostName: {
    //   arg: "hostname",
    // },
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
    // IP: {
    //   arg: "ip",
    // },
    // IP6: {
    //   arg: "ip6",
    // },
    // Label: {
    //   arg: "label",
    // },
    // LogDriver: {
    //   arg: "log-driver",
    // },
    // LogOpt: {
    //   arg: "log-opt",
    // },
    // Mask: {
    //   arg: "security-opt",
    // },
    // Memory: {
    //   arg: "memory",
    // },
    // Mount: {
    //   arg: "mount",
    // },
    // Network: {
    //   arg: "network",
    // },
    // NetworkAlias: {
    //   arg: "network-alias",
    // },
    // NoNewPrivileges: {
    //   arg: "security-opt",
    // },
    // Notify: {
    //   arg: "sdnotify",
    // },
    // PidsLimit: {
    //   arg: "pids-limit",
    // },
    // Pod: {
    //   arg: "pod",
    // },
    // PodmanArgs: {
    //   arg: "podman-args", // no arg, after podman run
    // },
    // PublishPort: {
    //   arg: "publish",
    // },
    // Pull: {
    //   arg: "pull",
    // },
    // ReadOnly: {
    //   arg: "read-only",
    // },
    // ReadOnlyTmpfs: {
    //   arg: "read-only-tmpfs",
    // },
    // ReloadCmd: {
    //   arg: "reload-cmd", // no arg
    // },
    // ReloadSignal: {
    //   arg: "reload-signal", // no arg
    // },
    // Retry: {
    //   arg: "retry",
    // },
    // RetryDelay: {
    //   arg: "retry-delay",
    // },
    // Rootfs: {
    //   arg: "rootfs",
    // },
    // RunInit: {
    //   arg: "init",
    // },
    // SeccompProfile: {
    //   arg: "security-opt seccomp",
    // },
    // Secret: {
    //   arg: "secret",
    // },
    // SecurityLabelDisable: {
    //   arg: "security-opt",
    // },
    // SecurityLabelFileType: {
    //   arg: "security-opt",
    // },
    // SecurityLabelLevel: {
    //   arg: "security-opt",
    // },
    // SecurityLabelNested: {
    //   arg: "security-opt",
    // },
    // SecurityLabelType: {
    //   arg: "security-opt",
    // },
    // ShmSize: {
    //   arg: "shm-size",
    // },
    // StartWithPod: {
    //   arg: "start-with-pod", // no arg
    // },
    // StopSignal: {
    //   arg: "stop-signal",
    // },
    // StopTimeout: {
    //   arg: "stop-timeout",
    // },
    // SubGIDMap: {
    //   arg: "subgidname",
    // },
    // SubUIDMap: {
    //   arg: "subuidname",
    // },
    // Sysctl: {
    //   arg: "sysctl",
    // },
    // Timezone: {
    //   arg: "tz",
    // },
    // Tmpfs: {
    //   arg: "tmpfs",
    // },
    // UIDMap: {
    //   arg: "uidmap",
    // },
    // Ulimit: {
    //   arg: "ulimit",
    // },
    // Unmask: {
    //   arg: "security-opt",
    // },
    // User: {
    //   arg: "user",
    // },
    // UserNS: {
    //   arg: "userns",
    // },
    // Volume: {
    //   arg: "volume",
    // },
    // WorkingDir: {
    //   arg: "workdir",
    // },
  },
  pod: {
    AddHost: {},
    ContainersConfModule: {},
    DNS: {},
    DNSOption: {},
    DNSSearch: {},
    GIDMap: {},
    GlobalArgs: {},
    HostName: {},
    IP: {},
    IP6: {},
    Label: {},
    Network: {},
    NetworkAlias: {},
    PodmanArgs: {},
    PodName: {},
    PublishPort: {},
    ServiceName: {},
    ShmSize: {},
    SubGIDMap: {},
    SubUIDMap: {},
    UIDMap: {},
    UserNS: {},
    Volume: {},
  },
  kube: {
    AutoUpdate: {},
    ConfigMap: {},
    ContainersConfModule: {},
    ExitCodePropagation: {},
    GlobalArgs: {},
    KubeDownForce: {},
    LogDriver: {},
    Network: {},
    PodmanArgs: {},
    PublishPort: {},
    SetWorkingDirectory: {},
    UserNS: {},
    Yaml: {},
  },
  network: {
    ContainersConfModule: {},
    DisableDNS: {},
    DNS: {},
    Driver: {},
    Gateway: {},
    GlobalArgs: {},
    Internal: {},
    IPAMDriver: {},
    IPRange: {},
    IPv6: {},
    Label: {},
    NetworkDeleteOnStop: {},
    NetworkName: {},
    Options: {},
    PodmanArgs: {},
    Subnet: {},
  },
  volume: {
    ContainersConfModule: {},
    Copy: {},
    Device: {},
    Driver: {},
    GlobalArgs: {},
    Group: {},
    Image: {},
    Label: {},
    Options: {},
    PodmanArgs: {},
    Type: {},
    User: {},
    VolumeName: {},
  },
  build: {
    Annotation: {},
    Arch: {},
    AuthFile: {},
    ContainersConfModule: {},
    DNS: {},
    DNSOption: {},
    DNSSearch: {},
    Environment: {},
    File: {},
    ForceRM: {},
    GlobalArgs: {},
    GroupAdd: {},
    ImageTag: {},
    Label: {},
    Network: {},
    PodmanArgs: {},
    Pull: {},
    Retry: {},
    RetryDelay: {},
    Secret: {},
    SetWorkingDirectory: {},
    Target: {},
    TLSVerify: {},
    Variant: {},
    Volume: {},
  },
  image: {
    AllTags: {},
    Arch: {},
    AuthFile: {},
    CertDir: {},
    ContainersConfModule: {},
    Creds: {},
    DecryptionKey: {},
    GlobalArgs: {},
    Image: {},
    ImageTag: {},
    OS: {},
    PodmanArgs: {},
    Retry: {},
    RetryDelay: {},
    TLSVerify: {},
    Variant: {},
  },
};
