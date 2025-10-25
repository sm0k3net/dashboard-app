(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const uid = (prefix = "id") => `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

  const debounce = (fn, wait = 250) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), wait);
    };
  };

  const formatDateTime = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;

  const downloadJSON = (filename, obj) => {
    const data = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const readFileAsText = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsText(file, "utf-8");
    });

  const ensureHttps = (url) => {
    try {
      const u = new URL(url);
      if (u.protocol === "http:") u.protocol = "https:";
      return u.toString();
    } catch {
      return url;
    }
  };

  const getFaviconUrl = (url) => {
    try {
      const u = new URL(url);
      return `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(u.origin)}`;
    } catch {
      return "";
    }
  };

  const toast = (() => {
    let timer;
    return (msg, ms = 2000) => {
      const el = document.getElementById("toast");
      if (!el) return;
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove("show"), ms);
    };
  })();

  window.EDUtils = { $, $$, uid, debounce, formatDateTime, downloadJSON, readFileAsText, ensureHttps, getFaviconUrl, toast };
})();
