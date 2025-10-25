(function () {
  const STORAGE_KEY = "easydash-config-v1";

  // Built-in fallback config (if local file fetch is blocked)
  const fallbackConfig = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    settings: { theme: "auto" },
    groups: [
      { id: "grp-all", name: "All", color: "#64748b", locked: true },
      { id: "grp-ungrouped", name: "Ungrouped", color: "#94a3b8", locked: true },
      { id: "grp-comm", name: "Communication", color: "#60a5fa" },
      { id: "grp-prod", name: "Productivity", color: "#34d399" },
      { id: "grp-dev", name: "Dev & Hosting", color: "#f59e0b" },
      { id: "grp-cloud", name: "Cloud & DNS", color: "#a78bfa" },
      { id: "grp-automation", name: "Automation", color: "#f97316" },
      { id: "grp-vpn", name: "VPN", color: "#ef4444" },
      { id: "grp-storage", name: "Storage", color: "#22c55e" },
      { id: "grp-meetings", name: "Meetings", color: "#06b6d4" },
      { id: "grp-ai", name: "AI", color: "#e879f9" },
      { id: "grp-diagrams", name: "Diagrams", color: "#10b981" }
    ],
    services: [
      { id: "svc-slack", name: "Slack", url: "https://slack.com/signin", groupId: "grp-comm", tags: ["chat"], notes: "" },
      { id: "svc-gmail", name: "Gmail", url: "https://mail.google.com", groupId: "grp-comm", tags: ["email"], notes: "" },
      { id: "svc-notion", name: "Notion", url: "https://notion.so", groupId: "grp-prod", tags: ["docs","notes"], notes: "" },
      { id: "svc-drive", name: "Google Drive", url: "https://drive.google.com", groupId: "grp-prod", tags: ["files"], notes: "" },
      { id: "svc-cal", name: "Google Calendar", url: "https://calendar.google.com", groupId: "grp-prod", tags: ["calendar"], notes: "" },
      { id: "svc-miro", name: "Miro", url: "https://miro.com/app", groupId: "grp-prod", tags: ["whiteboard"], notes: "" },
      { id: "svc-n8n", name: "n8n", url: "https://app.n8n.cloud", groupId: "grp-automation", tags: ["automation"], notes: "" },
      { id: "svc-zapier", name: "Zapier", url: "https://zapier.com/app/dashboard", groupId: "grp-automation", tags: ["automation"], notes: "" },
      { id: "svc-wireguard", name: "WireGuard", url: "https://www.wireguard.com", groupId: "grp-vpn", tags: ["vpn"], notes: "" },
      { id: "svc-openvpn", name: "OpenVPN", url: "https://openvpn.net", groupId: "grp-vpn", tags: ["vpn"], notes: "" },
      { id: "svc-gh", name: "GitHub", url: "https://github.com", groupId: "grp-dev", tags: ["code"], notes: "" },
      { id: "svc-render", name: "Render.com", url: "https://dashboard.render.com", groupId: "grp-dev", tags: ["hosting"], notes: "" },
      { id: "svc-supabase", name: "Supabase", url: "https://app.supabase.com", groupId: "grp-dev", tags: ["db","auth"], notes: "" },
      { id: "svc-infinityfree", name: "InfinityFree", url: "https://app.infinityfree.net", groupId: "grp-dev", tags: ["hosting"], notes: "" },
      { id: "svc-openrouter", name: "OpenRouter", url: "https://openrouter.ai", groupId: "grp-dev", tags: ["ai","api"], notes: "" },
      { id: "svc-smtp2go", name: "SMTP2GO", url: "https://app.smtp2go.com", groupId: "grp-dev", tags: ["email"], notes: "" },
      { id: "svc-cloudflare", name: "Cloudflare", url: "https://dash.cloudflare.com", groupId: "grp-cloud", tags: ["dns","security"], notes: "" },
      { id: "svc-gcloud", name: "Google Cloud", url: "https://console.cloud.google.com", groupId: "grp-cloud", tags: ["cloud"], notes: "" },
      { id: "svc-cloudshell", name: "Google Cloud Shell", url: "https://shell.cloud.google.com", groupId: "grp-cloud", tags: ["shell"], notes: "" },
      { id: "svc-protonmail", name: "Proton Mail", url: "https://mail.proton.me", groupId: "grp-comm", tags: ["email"], notes: "" },
      { id: "svc-protonvpn", name: "Proton VPN", url: "https://account.proton.me/u/0/vpn", groupId: "grp-vpn", tags: ["vpn"], notes: "" },
      { id: "svc-dropbox", name: "Dropbox", url: "https://dropbox.com", groupId: "grp-storage", tags: ["files"], notes: "" },
      { id: "svc-onedrive", name: "OneDrive", url: "https://onedrive.live.com", groupId: "grp-storage", tags: ["files"], notes: "" },
      { id: "svc-asana", name: "Asana", url: "https://app.asana.com", groupId: "grp-prod", tags: ["tasks"], notes: "" },
      { id: "svc-mermaid", name: "Mermaid Live", url: "https://mermaid.live", groupId: "grp-diagrams", tags: ["diagrams"], notes: "" },
      { id: "svc-perplexity", name: "Perplexity", url: "https://www.perplexity.ai", groupId: "grp-ai", tags: ["ai"], notes: "" },
      { id: "svc-mscopilot", name: "Microsoft Copilot", url: "https://copilot.microsoft.com", groupId: "grp-ai", tags: ["ai"], notes: "" },
      { id: "svc-lovable", name: "Lovable", url: "https://lovable.dev", groupId: "grp-ai", tags: ["ai","code"], notes: "" },
      { id: "svc-pwdmgr", name: "Password Manager", url: "https://1password.com", groupId: "grp-prod", tags: ["security"], notes: "" },
      { id: "svc-google-meet", name: "Google Meet", url: "https://meet.google.com", groupId: "grp-meetings", tags: ["meetings"], notes: "" },
      { id: "svc-zoom", name: "Zoom", url: "https://zoom.us", groupId: "grp-meetings", tags: ["meetings"], notes: "" },
      { id: "svc-calendly", name: "Calendly", url: "https://calendly.com", groupId: "grp-meetings", tags: ["scheduling"], notes: "" },
      { id: "svc-fireflies", name: "Fireflies AI", url: "https://app.fireflies.ai", groupId: "grp-ai", tags: ["meetings","ai"], notes: "" },
      { id: "svc-onedrive2", name: "Google Drive (Work)", url: "https://drive.google.com", groupId: "grp-storage", tags: ["files"], notes: "" }
    ]
  };

  let _config = null;
  const listeners = new Set();

  const notify = () => listeners.forEach((fn) => fn(_config));

  const save = () => {
    _config.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_config));
    notify();
  };

  const load = async () => {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try {
        _config = JSON.parse(local);
        return _config;
      } catch {
        // corrupted localStorage; wipe
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    // Try fetch JSON file
    try {
      const res = await fetch("data/config.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch config.json");
      const json = await res.json();
      _config = json;
      save(); // prime local storage
      return _config;
    } catch {
      // Fallback to built-in
      _config = fallbackConfig;
      save();
      return _config;
    }
  };

  const exportConfig = () => {
    EDUtils.downloadJSON(`easydash-config-${EDUtils.formatDateTime().replace(/[ :]/g, "-")}.json`, _config);
  };

  const importFromText = async (text) => {
    const parsed = JSON.parse(text);
    if (!parsed || !Array.isArray(parsed.groups) || !Array.isArray(parsed.services)) {
      throw new Error("Invalid config format");
    }
    _config = parsed;
    save();
  };

  const on = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

  const findGroup = (id) => _config.groups.find((g) => g.id === id);
  const findService = (id) => _config.services.find((s) => s.id === id);

  const listGroups = () => _config.groups.slice();
  const listServices = (opts = {}) => {
    const { groupId, query } = opts;
    let list = _config.services.slice();

    if (groupId && groupId !== "grp-all") {
      list = list.filter((s) => (groupId === "grp-ungrouped" ? !s.groupId || s.groupId === "grp-ungrouped" : s.groupId === groupId));
    }

    if (query) {
      const q = query.toLowerCase();
      list = list.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        (s.url && s.url.toLowerCase().includes(q)) ||
        (Array.isArray(s.tags) && s.tags.some((t) => String(t).toLowerCase().includes(q)))
      );
    }

    // stable sort by name
    return list.sort((a, b) => a.name.localeCompare(b.name));
  };

  const addGroup = ({ name, color }) => {
    const id = `grp-${name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 12) || EDUtils.uid("grp")}`;
    _config.groups.push({ id, name, color: color || "#94a3b8" });
    save();
    return id;
  };

  const updateGroup = (id, patch) => {
    const g = findGroup(id);
    if (!g || g.locked) return;
    Object.assign(g, patch);
    save();
  };

  const deleteGroup = (id) => {
    const g = findGroup(id);
    if (!g || g.locked) return;
    // move services to ungrouped
    _config.services.forEach((s) => {
      if (s.groupId === id) s.groupId = "grp-ungrouped";
    });
    _config.groups = _config.groups.filter((gg) => gg.id !== id);
    save();
  };

  const addService = ({ name, url, groupId, tags, notes }) => {
    const id = EDUtils.uid("svc");
    _config.services.push({
      id,
      name,
      url: EDUtils.ensureHttps(url),
      groupId: groupId || "grp-ungrouped",
      tags: (tags || []).filter(Boolean),
      notes: notes || ""
    });
    save();
    return id;
  };

  const updateService = (id, patch) => {
    const s = findService(id);
    if (!s) return;
    if (patch.url) patch.url = EDUtils.ensureHttps(patch.url);
    Object.assign(s, patch);
    save();
  };

  const deleteService = (id) => {
    _config.services = _config.services.filter((s) => s.id !== id);
    save();
  };

  const setTheme = (theme) => {
    _config.settings = _config.settings || {};
    _config.settings.theme = theme;
    save();
  };

  const getTheme = () => (_config?.settings?.theme) || "auto";
  const getConfig = () => _config;

  window.EDStorage = {
    load,
    on,
    listGroups,
    listServices,
    addGroup,
    updateGroup,
    deleteGroup,
    addService,
    updateService,
    deleteService,
    exportConfig,
    importFromText,
    setTheme,
    getTheme,
    getConfig
  };
})();
