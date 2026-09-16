// Small interactive extras: a species hunt, core samples in the career layers,
// a terminal (press ~), and Antarctica mode (Konami code). The page works without any of it.
(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const store = {
    get(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Storage can be blocked; progress just won't persist.
      }
    },
  };

  /* Toast */
  const toast = document.getElementById("toast");
  let toastTimer;

  function say(message, ms = 3600) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), ms);
  }

  /* Species hunt */
  const critters = [...document.querySelectorAll(".critter")];
  const total = critters.length;
  const found = new Set(store.get("species-found", []));
  const log = document.getElementById("field-log");
  const logCount = log.querySelector("[data-count]");
  const logList = log.querySelector("ul");
  const logDone = log.querySelector("[data-done]");

  function renderLog() {
    logCount.textContent = `${found.size} of ${total}`;
    logList.replaceChildren(
      ...critters.map((critter) => {
        const item = document.createElement("li");
        const spotted = found.has(critter.dataset.species);
        item.className = spotted ? "is-found" : "";
        item.title = spotted ? critter.dataset.name : "Not spotted yet";
        item.innerHTML = critter.innerHTML;
        return item;
      })
    );
    critters.forEach((critter) =>
      critter.classList.toggle("is-found", found.has(critter.dataset.species))
    );
    log.hidden = found.size === 0;
    logDone.hidden = found.size < total;
  }

  critters.forEach((critter) => {
    critter.addEventListener("click", (event) => {
      event.stopPropagation();
      const isNew = !found.has(critter.dataset.species);
      found.add(critter.dataset.species);
      store.set("species-found", [...found]);
      renderLog();

      if (isNew && found.size === total) {
        say(`Research grade! You spotted all ${total} species on this page.`, 6000);
      } else if (isNew) {
        say(`Observed: ${critter.dataset.name}. ${critter.dataset.note}`);
      } else {
        say(`Already in your field log: ${critter.dataset.name}.`);
      }
    });
  });

  log.querySelector("[data-reset]").addEventListener("click", () => {
    found.clear();
    store.set("species-found", []);
    renderLog();
    say("Field log cleared. The species are back in hiding.");
  });

  renderLog();

  /* Core samples: click a career layer to dig */
  document.querySelectorAll(".stratum").forEach((layer) => {
    const sample = layer.querySelector(".core-sample");
    const inner = layer.querySelector(".wrap");

    layer.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) return;
      if (String(window.getSelection())) return;
      sample.hidden = !sample.hidden;
      if (!reducedMotion) {
        inner.classList.remove("is-digging");
        void inner.offsetWidth;
        inner.classList.add("is-digging");
      }
    });
  });

  /* Antarctica mode */
  const PENGUIN_FILLED =
    '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16 3.5c-4 0-6 4-6 9v7.5c0 5 2 8 6 8s6-3 6-8v-7.5c0-5-2-9-6-9z"/><path fill="#fff" d="M16 10.5c-2.4 0-3.4 3-3.4 6v3.8c0 3.4 1.4 5 3.4 5s3.4-1.6 3.4-5v-3.8c0-3-1-6-3.4-6z"/><path fill="#ff6a13" d="M19.5 8.3l3.5 1.2-3.5 1z"/><path stroke="#ff6a13" stroke-width="1.8" stroke-linecap="round" d="M12.5 28.5h3M16.5 28.5h3"/></svg>';

  let snowing = false;
  let frame = 0;
  let canvas;
  let context;
  let flakes = [];

  function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = innerWidth * ratio;
    canvas.height = innerHeight * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function drawFlakes() {
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    context.clearRect(0, 0, innerWidth, innerHeight);
    context.fillStyle = dark ? "rgba(255, 255, 255, 0.85)" : "rgba(111, 140, 150, 0.6)";
    for (const flake of flakes) {
      context.beginPath();
      context.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
      context.fill();
    }
  }

  function tick() {
    for (const flake of flakes) {
      flake.y += flake.speed;
      flake.phase += 0.01;
      flake.x += Math.sin(flake.phase) * 0.4;
      if (flake.y > innerHeight + 5) {
        flake.y = -5;
        flake.x = Math.random() * innerWidth;
      }
    }
    drawFlakes();
    frame = requestAnimationFrame(tick);
  }

  function waddle() {
    const penguin = document.createElement("div");
    penguin.className = "waddler";
    penguin.setAttribute("aria-hidden", "true");
    penguin.innerHTML = PENGUIN_FILLED;
    penguin.addEventListener("animationend", (event) => {
      if (event.target === penguin) penguin.remove();
    });
    document.body.append(penguin);
  }

  function setSnow(on) {
    snowing = on;
    if (on) {
      canvas = document.createElement("canvas");
      canvas.className = "snow";
      canvas.setAttribute("aria-hidden", "true");
      document.body.append(canvas);
      context = canvas.getContext("2d");
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      flakes = Array.from({ length: Math.round(innerWidth / 10) }, () => ({
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        r: 1 + Math.random() * 2.5,
        speed: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
      }));
      if (reducedMotion) {
        drawFlakes();
      } else {
        tick();
        waddle();
      }
      say("Welcome to Antarctica. Dress warmly. Enter the code again to thaw.", 5000);
    } else {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resizeCanvas);
      canvas.remove();
      say("Thawed. Back to the Bay Area.");
    }
  }

  const konami = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let konamiStep = 0;

  document.addEventListener("keydown", (event) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === konami[konamiStep]) {
      konamiStep += 1;
    } else {
      konamiStep = key === konami[0] ? 1 : 0;
    }
    if (konamiStep === konami.length) {
      konamiStep = 0;
      setSnow(!snowing);
    }
  });

  /* Terminal */
  const terminal = document.getElementById("terminal");
  const output = document.getElementById("terminal-output");
  const form = document.getElementById("terminal-form");
  const input = document.getElementById("terminal-input");
  const history = [];
  let historyIndex = 0;

  const files = {
    "career.txt":
      "Engineering leader     now, at Delos Insurance Solutions\nSoftware engineer\nQA engineer\nSystem administrator   where it started",
    "principles.txt":
      'Acceptance   "I am human, nothing human is foreign to me."  Terence\nCourage      "Justification = reluctance."\nOptimism     "The primary cause of unhappiness is not the situation,\n              but your thoughts about it."  Eckhart Tolle',
    "away.txt":
      "Travel films, photography, nature notes, reading, and giving back.\nThe links are in the \"Away from work\" section.",
    "contact.txt": "LinkedIn: linkedin.com/in/khmelkov\nOr skip the formalities: sudo hire andrii",
  };

  const greetings = () => "Hello! Привіт! Привет!";

  const commands = {
    help: () =>
      "whoami          who runs this place\nls              list files\ncat <file>      read a file\nuptime          how long this has been running\nping andrii     check if I'm reachable\nspecies         your field log progress\nsnow            Antarctica mode\nhello           say hi, in three languages\nclear, exit",
    whoami: () =>
      "Andrii Khmelkov. System administrator, then QA engineer, then software engineer.\nNow an engineering leader in the San Francisco Bay Area.",
    ls: () => Object.keys(files).join("   "),
    cat: ([name]) => {
      if (!name) return "usage: cat <file>";
      return files[name] ?? `cat: ${name}: No such file. Try ls.`;
    },
    uptime: () => "up since the first server I kept alive, load average: high ambiguity, handled",
    ping: ([host]) =>
      host === "andrii"
        ? "PING andrii (linkedin.com/in/khmelkov)\n64 bytes from andrii: icmp_seq=1 time=fast\n1 packet transmitted, 1 received, 0% packet loss"
        : `ping: ${host ?? ""}: unknown host. Try ping andrii.`,
    species: () =>
      found.size === total
        ? `Field log: all ${total} species spotted. Research grade.`
        : `Field log: ${found.size} of ${total} species spotted. Keep scrolling and look closely.`,
    snow: () => {
      setSnow(!snowing);
      return snowing ? "Antarctica mode on. Type snow again to thaw." : "Thawed.";
    },
    hello: greetings,
    hi: greetings,
    "привіт": greetings,
    sudo: (args) => {
      if (args.join(" ") === "hire andrii") {
        window.open("https://www.linkedin.com/in/khmelkov/", "_blank", "noopener");
        return "[sudo] permission granted. Opening LinkedIn in a new tab.";
      }
      return "visitor is not in the sudoers file. This incident will be reported.\n(Hint: sudo hire andrii)";
    },
    rm: (args) =>
      args.some((arg) => arg.startsWith("-") && arg.includes("r"))
        ? "Nice try. The sysadmin in me keeps backups."
        : "rm: permission denied",
    clear: () => {
      output.replaceChildren();
      return null;
    },
    exit: () => {
      terminal.close();
      return null;
    },
  };

  function print(text, className) {
    const line = document.createElement("div");
    if (className) line.className = className;
    line.textContent = text;
    output.append(line);
    output.scrollTop = output.scrollHeight;
  }

  function openTerminal() {
    if (terminal.open) return;
    if (!output.childElementCount) {
      print("Welcome to khmelkov.net. Type help to see what you can do here.", "is-muted");
    }
    terminal.showModal();
    input.focus();
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const line = input.value.trim();
    input.value = "";
    if (!line) return;
    history.push(line);
    historyIndex = history.length;
    print(`$ ${line}`, "is-command");
    const [name, ...args] = line.split(/\s+/);
    const command = commands[name.toLowerCase()];
    const result = command ? command(args) : `command not found: ${name}. Type help.`;
    if (result) print(result);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" && historyIndex > 0) {
      historyIndex -= 1;
      input.value = history[historyIndex];
      event.preventDefault();
    } else if (event.key === "ArrowDown" && historyIndex < history.length) {
      historyIndex += 1;
      input.value = history[historyIndex] ?? "";
      event.preventDefault();
    }
  });

  terminal.querySelector("[data-close]").addEventListener("click", () => terminal.close());
  terminal.addEventListener("click", (event) => {
    if (event.target === terminal) terminal.close();
  });

  document.querySelectorAll("[data-open-terminal]").forEach((button) =>
    button.addEventListener("click", openTerminal)
  );

  document.addEventListener("keydown", (event) => {
    if (event.target.closest("input, textarea, [contenteditable]")) return;
    if (event.key === "`" || event.key === "~") {
      event.preventDefault();
      openTerminal();
    }
  });

  /* A hello for anyone who opens DevTools */
  console.log("%cHi, fellow curious person.", "font: 700 16px Archivo, sans-serif; color: #ff6a13");
  console.log("Press ~ on the page for a terminal, or try the Konami code.");
})();
