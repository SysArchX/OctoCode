const tracks = [
  { name: "Lógica & Portugol", mark: "LG", desc: "Variáveis, condições, laços e vetores com visualizador de memória. A base de todas as trilhas.", source: "CS50 · material de algoritmos" },
  { name: "Python", mark: "PY", desc: "Do print ao FastAPI: tipos, listas, funções, POO, arquivos e projeto final com CLI real.", source: "Python.org docs" },
  { name: "JavaScript", mark: "JS", desc: "Escopo, closures, assíncrono, DOM e Fetch, terminando em uma aplicação de tarefas.", source: "MDN Web Docs" },
  { name: "TypeScript", mark: "TS", desc: "Tipos, generics, narrowing e modelagem de domínio aplicada a um projeto tipado.", source: "typescriptlang.org" },
  { name: "C", mark: "C", desc: "Ponteiros, memória, structs e compilação. O que acontece embaixo do JavaScript.", source: "ISO C / cppreference" },
  { name: "C++", mark: "C++", desc: "RAII, STL, referências e orientação a objetos com C++ moderno (C++20).", source: "isocpp.org · cppreference" },
  { name: "C#", mark: "C#", desc: "Tipos, LINQ, async/await e POO com .NET, do console ao projeto final.", source: "Microsoft Learn" },
  { name: "Java", mark: "JV", desc: "JVM, classes, coleções, exceções e concorrência com práticas de mercado.", source: "Oracle Java Docs" },
  { name: "Go", mark: "GO", desc: "Goroutines, canais, interfaces e a filosofia de simplicidade da linguagem.", source: "go.dev/doc" },
  { name: "Rust", mark: "RS", desc: "Ownership, borrow checker, Result/Option e concorrência sem medo, com o Rust Book.", source: "The Rust Book" },
  { name: "PHP", mark: "PHP", desc: "Sintaxe, arrays, PDO e APIs com PHP 8, sem framework mágico.", source: "php.net manual" },
  { name: "SQL", mark: "SQL", desc: "SELECT, joins, índices, transações e modelagem relacional em bancos reais.", source: "PostgreSQL Docs" },
  { name: "HTML & CSS", mark: "H", desc: "Semântica, flexbox, grid, responsividade e acessibilidade sem framework.", source: "MDN + W3C" },
  { name: "Linux · OctoCoreOS", mark: "LX", desc: "Permissões POSIX, processos, redes e automação em shell dentro do app.", source: "Linux Man Pages" },
  { name: "Ethical Hacking", mark: "EH", desc: "Recon, enumeração, hashes e exploração simulada em alvos fictícios, com ética.", source: "OWASP Top 10" },
];

const catalog = document.getElementById("catalog");
if (catalog) {
  catalog.innerHTML = tracks
    .map(
      (track) => `
      <article class="card">
        <div class="card-top">
          <span class="card-mark">${track.mark}</span>
          <h3>${track.name}</h3>
        </div>
        <p>${track.desc}</p>
        <span class="source">Fonte: ${track.source}</span>
      </article>`,
    )
    .join("");
}

/* ---------- Central de downloads (menu de 3 tracinhos) ---------- */

const menuToggle = document.getElementById("menu-toggle");
const panel = document.getElementById("download-panel");
const scrim = document.getElementById("download-scrim");
const closeButton = document.getElementById("download-close");

function setMenu(open) {
  if (!panel || !scrim || !menuToggle) return;
  panel.classList.toggle("is-open", open);
  scrim.hidden = !open;
  panel.setAttribute("aria-hidden", String(!open));
  menuToggle.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("menu-open", open);
  if (open) closeButton?.focus();
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => setMenu(!panel.classList.contains("is-open")));
}
closeButton?.addEventListener("click", () => setMenu(false));
scrim?.addEventListener("click", () => setMenu(false));

document.querySelectorAll("[data-open-downloads]").forEach((button) => {
  button.addEventListener("click", () => setMenu(true));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

/* ---------- Terminal demo ---------- */

const output = document.getElementById("terminal-output");
const form = document.getElementById("terminal-form");
const field = document.getElementById("terminal-field");

const ART = [
  "       _.-''''''-._       ",
  "     .'   •    •   '.     ",
  "    /       <        \\    ",
  "   |                  |   ",
  "   |    '--------'    |    ",
  "    \\                /    ",
  "    /|\\  /|\\  /|\\  /|\\   ",
  "   / | \\/ | \\/ | \\/ | \\  ",
];

const SPECS = [
  "octo@octocore",
  "------------",
  "OS: OctoCoreOS 1.0",
  "Kernel: 6.11.0-octo-sec",
  "Shell: octosh",
  "Uptime: 3 hours, 12 mins",
  "Packages: 842 (dpkg)",
  "Tools: CyberSuite Ready",
];

const files = {
  "notas.md": "# Notas\n- Revisar permissões POSIX\n- Testar nmap em 10.10.14.7",
  "scan.sh": "#!/bin/octosh\nnmap -sV 10.10.14.7\n",
};

const LONG_LS = [
  "-rw-r--r-- 1 octo octo  142 Nov 20 09:12 notas.md",
  "-rwxr-xr-x 1 octo octo   38 Nov 20 09:04 scan.sh",
  "drwxr-xr-x 2 octo octo 4096 Nov 20 08:58 projetos",
];

function print(text, tone = "") {
  if (!output) return;
  const line = document.createElement("div");
  line.textContent = text;
  if (tone) line.className = tone;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

function run(command) {
  const raw = command.trim();
  if (!raw) return;
  print(`octo@octocore:~$ ${raw}`, "muted");
  const [bin, ...args] = raw.split(/\s+/);

  switch (bin) {
    case "help":
      print("Comandos: ls, cat, whoami, id, pwd, uname, date, ps, ip, nmap, sudo, octofetch, clear", "accent");
      print("No app existe a suíte completa: gobuster, hydra, sqlmap, nikto, msfconsole, chmod.", "muted");
      break;
    case "clear":
      output.innerHTML = "";
      break;
    case "octofetch":
      ART.forEach((line, index) => print(`${line}  ${SPECS[index] ?? ""}`, index < 4 ? "accent" : ""));
      break;
    case "ls":
      if (args.some((arg) => arg.startsWith("-") && arg.includes("l"))) {
        LONG_LS.forEach((line) => print(line));
      } else {
        print(Object.keys(files).join("  "));
      }
      break;
    case "pwd":
      print("/home/octo");
      break;
    case "whoami":
      print("octo");
      break;
    case "id":
      print("uid=1000(octo) gid=1000(octo) groups=1000(octo),27(sudo)");
      break;
    case "uname":
      print("Linux octocore 6.11.0-octo-sec #1 SMP PREEMPT_DYNAMIC OctoCoreOS");
      break;
    case "date":
      print(new Date().toUTCString());
      break;
    case "cat": {
      const target = args[0] ?? "";
      if (target === "/etc/shadow") {
        print("cat: /etc/shadow: Permission denied", "err");
        print("Dica: o dono é root e o modo é 600. Tente com sudo no app.", "muted");
      } else if (files[target]) {
        print(files[target]);
      } else if (target === "/etc/passwd") {
        print("root:x:0:0:root:/root:/bin/octosh");
        print("octo:x:1000:1000:Octo:/home/octo:/bin/octosh");
      } else {
        print(`cat: ${target}: No such file or directory`, "err");
      }
      break;
    }
    case "ps":
      print("  PID TTY          TIME CMD");
      print("    1 ?        00:00:02 systemd");
      print("  412 pts/0    00:00:00 octosh");
      break;
    case "ip":
      print("1: lo: <LOOPBACK,UP> mtu 65536");
      print("2: eth0: <BROADCAST,UP> mtu 1500");
      print("    inet 10.10.14.23/24 scope global eth0", "muted");
      break;
    case "nmap":
      print("Starting Nmap 7.94 ( https://nmap.org )", "muted");
      print("Nmap scan report for 10.10.14.7");
      print("22/tcp   open  ssh     OpenSSH 9.6");
      print("80/tcp   open  http    nginx 1.24.0");
      print("Nmap done: 1 IP address scanned", "ok");
      break;
    case "chmod":
      print("ok (simulado): modo alterado no sistema de arquivos virtual", "ok");
      break;
    case "sudo":
      print("No app, sudo su eleva para root e libera /etc e /var/log.", "accent");
      break;
    default:
      print(`${bin}: command not found`, "err");
      print("digite help para ver os comandos", "muted");
  }
}

if (output) {
  print("OctoCoreOS 1.0 · octosh", "accent");
  print("Digite help ou octofetch para começar.", "muted");
  print("");
}

if (form && field) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run(field.value);
    field.value = "";
  });
}

document.querySelectorAll("[data-cmd]").forEach((button) => {
  button.addEventListener("click", () => {
    run(button.getAttribute("data-cmd"));
    field?.focus();
  });
});

/* ---------- PWA ---------- */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => undefined);
  });
}
