export type Tone = "ink" | "muted" | "accent" | "success" | "danger" | "art";

export interface Line {
  text: string;
  tone?: Tone;
}

export interface ShellResult {
  lines: Line[];
  state: ShellState;
  clear?: boolean;
}

export interface ShellState {
  cwd: string;
  user: string;
  sudo: boolean;
  files: Record<string, { mode: number; owner: string; content?: string }>;
}

export const initialShell: ShellState = {
  cwd: "/home/octo",
  user: "octo",
  sudo: false,
  files: {
    "/home/octo": { mode: 0o755, owner: "octo" },
    "/home/octo/notas.md": {
      mode: 0o644,
      owner: "octo",
      content: "# Notas\n- Revisar permissoes POSIX\n- Testar nmap em 10.10.14.7",
    },
    "/home/octo/scan.sh": {
      mode: 0o644,
      owner: "octo",
      content: "#!/bin/octosh\nnmap -sV 10.10.14.7\n",
    },
    "/etc": { mode: 0o755, owner: "root" },
    "/etc/passwd": {
      mode: 0o644,
      owner: "root",
      content: "root:x:0:0:root:/root:/bin/octosh\nocto:x:1000:1000:Octo:/home/octo:/bin/octosh",
    },
    "/etc/shadow": { mode: 0o600, owner: "root", content: "root:*:19000:0:99999:7:::\nocto:*:19000:0:99999:7:::" },
    "/var": { mode: 0o755, owner: "root" },
    "/var/log": { mode: 0o755, owner: "root" },
    "/tmp": { mode: 0o1777, owner: "root" },
  },
};

/**
 * The official minimal Octo (• <) drawn in ASCII: the artwork is centered and
 * the system specs print underneath, so nothing wraps on a phone screen.
 */
const OCTO_ART = [
  "      .-''''''-.",
  "    .'  •    <  '.",
  "   /              \\",
  "  |                |",
  "   \\              /",
  "    '-.________.-'",
  "     /  | | | |  \\",
  "    /   | | | |   \\",
  "   (    | | | |    )",
  "    \\   /     \\   /",
  "     '-''     ''-'",
];

const OCTO_ART_WIDTH = Math.max(...OCTO_ART.map((line) => line.length));

function parentOf(path: string) {
  if (path === "/") return "/";
  const parts = path.split("/").filter(Boolean);
  parts.pop();
  return `/${parts.join("/")}`;
}

function resolve(cwd: string, target?: string) {
  if (!target || target === "~") return "/home/octo";
  if (target === ".") return cwd;
  const base = target.startsWith("/") ? target : `${cwd}/${target}`;
  const parts: string[] = [];
  for (const part of base.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return `/${parts.join("/")}`;
}

function canWrite(state: ShellState, path: string) {
  if (state.sudo || state.user === "root") return true;
  const parent = parentOf(path);
  if (parent === "/tmp") return true;
  if (parent === "/home/octo") return true;
  const node = state.files[path];
  return node ? node.owner === state.user : false;
}

function listDir(state: ShellState, path: string) {
  const prefix = path === "/" ? "/" : `${path}/`;
  return Object.keys(state.files)
    .filter((key) => key !== path && key.startsWith(prefix) && !key.slice(prefix.length).includes("/"))
    .map((key) => key.slice(prefix.length))
    .sort();
}

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function toBase64(text: string) {
  let output = "";
  for (let index = 0; index < text.length; index += 3) {
    const a = text.charCodeAt(index);
    const b = text.charCodeAt(index + 1);
    const c = text.charCodeAt(index + 2);
    const triple = (a << 16) | ((Number.isNaN(b) ? 0 : b) << 8) | (Number.isNaN(c) ? 0 : c);
    output += B64[(triple >> 18) & 63];
    output += B64[(triple >> 12) & 63];
    output += Number.isNaN(b) ? "=" : B64[(triple >> 6) & 63];
    output += Number.isNaN(c) ? "=" : B64[triple & 63];
  }
  return output;
}

export function runCommand(input: string, state: ShellState): ShellResult {
  const raw = input.trim();
  const next: ShellState = { ...state, files: { ...state.files } };
  const lines: Line[] = [];
  const push = (text: string, tone?: Tone) => lines.push({ text, tone });

  const parts = raw.split("|");
  if (parts.length > 1) {
    push("(pipe aceito · saída encaminhada)", "muted");
  }
  const [command, ...args] = parts[0].trim().split(/\s+/);

  if (!command) return { lines, state: next };

  switch (command) {
    case "help":
      push("OctoCoreOS 1.0 · comandos disponíveis");
      push("ls  cd  pwd  cat  whoami  id  echo  chmod  sudo  su  uname  date  ps  ip  nmap  curl  base64  clear", "muted");
      push("Pipes (|) e redirecionamento (>, >>) são aceitos.", "muted");
      break;
    case "clear":
      return { lines: [], state: next, clear: true };
    case "pwd":
      push(next.cwd);
      break;
    case "whoami":
      push(next.sudo ? "root" : next.user);
      break;
    case "id":
      push(
        next.sudo
          ? "uid=0(root) gid=0(root) groups=0(root)"
          : "uid=1000(octo) gid=1000(octo) groups=1000(octo),27(sudo)",
      );
      break;
    case "echo":
      push(args.join(" ").replace(/^["']|["']$/g, ""));
      break;
    case "date":
      push(new Date().toUTCString());
      break;
    case "uname":
      push("Linux octocore 6.11.0-octo-sec #1 SMP PREEMPT_DYNAMIC OctoCoreOS");
      break;
    case "ls": {
      const flags = args.filter((arg) => arg.startsWith("-")).join("");
      const target = args.find((arg) => !arg.startsWith("-"));
      const path = resolve(next.cwd, target);
      const node = next.files[path];
      if (!node) {
        push(`ls: cannot access '${target ?? path}': No such file or directory`, "danger");
        break;
      }
      if (node.content !== undefined) {
        push(target ?? path);
        break;
      }
      const entries = listDir(next, path);
      if (flags.includes("l")) {
        for (const entry of entries) {
          const child = next.files[`${path === "/" ? "" : path}/${entry}`];
          if (!child) continue;
          const mode = child.mode.toString(8).padStart(3, "0");
          push(`${mode} 1 ${child.owner} octo ${child.content !== undefined ? " 512" : "4096"} ${entry}`);
        }
      } else {
        push(entries.join("  ") || "(vazio)");
      }
      break;
    }
    case "cd": {
      const path = resolve(next.cwd, args[0]);
      const node = next.files[path];
      if (!node || node.content !== undefined) {
        push(`cd: ${args[0] ?? "~"}: No such file or directory`, "danger");
        break;
      }
      next.cwd = path;
      break;
    }
    case "cat": {
      const path = resolve(next.cwd, args[0]);
      const node = next.files[path];
      if (!node) {
        push(`cat: ${args[0] ?? ""}: No such file or directory`, "danger");
        break;
      }
      if (node.content === undefined) {
        push(`cat: ${args[0] ?? ""}: Is a directory`, "danger");
        break;
      }
      node.content.split("\n").forEach((line) => push(line));
      break;
    }
    case "chmod": {
      const [mode, target] = args;
      const path = resolve(next.cwd, target);
      const node = next.files[path];
      if (!node) {
        push(`chmod: cannot access '${target ?? ""}': No such file or directory`, "danger");
        break;
      }
      if (!canWrite(next, path)) {
        push(`chmod: changing permissions of '${target}': Operation not permitted`, "danger");
        break;
      }
      next.files[path] = { ...node, mode: parseInt(mode ?? "644", 8) || 0o644 };
      push(`${target} agora tem permissao ${mode}`, "success");
      break;
    }
    case "sudo":
      if (args.length === 0) {
        push("usage: sudo <comando>", "muted");
        break;
      }
      if (args[0] === "su") {
        next.sudo = true;
        push("root@octocore:~# sessao elevada (simulada)", "success");
        break;
      }
      return runCommand(args.join(" "), { ...next, sudo: true });
    case "su":
      next.sudo = true;
      push("agora voce e root nesta sessao simulada", "muted");
      break;
    case "ps":
      push("  PID TTY          TIME CMD");
      push("    1 ?        00:00:02 systemd");
      push("  412 pts/0    00:00:00 octosh");
      push("  418 pts/0    00:00:00 ps");
      break;
    case "ip":
      push("1: lo: <LOOPBACK,UP> mtu 65536");
      push("2: eth0: <BROADCAST,UP> mtu 1500");
      push("    inet 10.10.14.23/24 brd 10.10.14.255 scope global eth0", "muted");
      break;
    case "nmap": {
      const target = args.filter((arg) => !arg.startsWith("-")).pop() ?? "10.10.14.7";
      push("Starting Nmap 7.94 ( https://nmap.org )", "muted");
      push(`Nmap scan report for ${target}`);
      push("PORT     STATE SERVICE     VERSION");
      push("22/tcp   open  ssh         OpenSSH 9.6 (Ubuntu)");
      push("80/tcp   open  http        nginx 1.24.0");
      push("3306/tcp open  mysql       MySQL 8.0.36");
      push("Nmap done: 1 IP address (1 host up) scanned", "success");
      break;
    }
    case "octofetch": {
      const specs = [
        "octo@octocore",
        "-----------",
        "OS: OctoCoreOS 1.0",
        "Kernel: 6.11.0-octo-sec",
        "Shell: octosh",
        "Uptime: 3 hours, 12 mins",
        "Packages: 842 (dpkg)",
        "Cybersecurity: pronto",
        "Terminal: octo-term",
      ];
      OCTO_ART.forEach((line, index) => {
        const left = Math.max(0, Math.floor((OCTO_ART_WIDTH - line.length) / 2));
        push(`${left > 0 ? " ".repeat(left) : ""}${line}`, "art");
      });
      push("");
      specs.forEach((spec, index) => {
        push(spec, index === 0 ? "accent" : index === 1 ? "muted" : "ink");
      });
      break;
    }
    case "curl": {
      const target = args[args.length - 1] ?? "";
      push("HTTP/1.1 200 OK", "muted");
      push(`{"host":"${target.replace(/^https?:\/\//, "")}","status":"ok"}`);
      break;
    }
    case "base64": {
      const text = args.filter((arg) => !arg.startsWith("-")).join(" ");
      push(toBase64(text));
      break;
    }
    case "rm":
    case "mv":
      push(`${command}: operacao bloqueada no modo demonstracao`, "danger");
      break;
    default:
      push(`${command}: command not found`, "danger");
      push("digite help para ver os comandos disponiveis", "muted");
  }

  return { lines, state: next };
}
