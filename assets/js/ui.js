(function () {
  const { $, $$, debounce, getFaviconUrl, toast } = EDUtils;

  let state = {
    selectedGroupId: "grp-all",
    query: ""
  };

  const setState = (patch) => {
    state = { ...state, ...patch };
    render();
    // update hash
    const params = new URLSearchParams();
    if (state.selectedGroupId && state.selectedGroupId !== "grp-all") params.set("group", state.selectedGroupId);
    if (state.query) params.set("q", state.query);
    const newHash = params.toString();
    location.hash = newHash ? `#${newHash}` : "";
  };

  const readHash = () => {
    const q = new URLSearchParams(location.hash.replace(/^#/, ""));
    const group = q.get("group");
    const query = q.get("q") || "";
    const groups = EDStorage.listGroups();
    if (group && groups.some((g) => g.id === group)) {
      state.selectedGroupId = group;
    } else {
      state.selectedGroupId = "grp-all";
    }
    state.query = query;
  };

  const modalRoot = () => $("#modal-root");
  const closeModal = () => {
    const root = modalRoot();
    if (root) root.setAttribute("aria-hidden", "true");
    root.innerHTML = "";
  };

  const openModal = ({ title, body, actions = [] }) => {
    const root = modalRoot();
    root.setAttribute("aria-hidden", "false");
    root.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-label="${title}">
        <header>
          <strong>${title}</strong>
          <button class="btn btn-ghost sm" id="modal-close" aria-label="Close">✕</button>
        </header>
        <div class="body">${body}</div>
        <footer id="modal-footer"></footer>
      </div>
    `;
    $("#modal-close").addEventListener("click", closeModal);
    const footer = $("#modal-footer");
    actions.forEach(({ label, className = "btn", onClick }) => {
      const b = document.createElement("button");
      b.className = className;
      b.textContent = label;
      b.addEventListener("click", onClick);
      footer.appendChild(b);
    });
  };

  // Group UI
  const renderGroups = () => {
    const groups = EDStorage.listGroups();
    const services = EDStorage.listServices();
    const list = $("#group-list");
    list.innerHTML = "";

    const countByGroup = groups.reduce((acc, g) => (acc[g.id] = 0, acc), {});
    services.forEach((s) => {
      const gid = s.groupId || "grp-ungrouped";
      if (countByGroup[gid] !== undefined) countByGroup[gid]++;
    });
    // All group count
    countByGroup["grp-all"] = services.length;

    groups
      .slice()
      .sort((a, b) => {
        // Keep All and Ungrouped at top
        const order = { "grp-all": -2, "grp-ungrouped": -1 };
        const ao = order[a.id] ?? 0, bo = order[b.id] ?? 0;
        if (ao !== bo) return ao - bo;
        return a.name.localeCompare(b.name);
      })
      .forEach((g) => {
        const item = document.createElement("div");
        item.className = "group-item" + (state.selectedGroupId === g.id ? " active" : "");
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");
        item.innerHTML = `
          <div class="group-dot" style="background:${g.color || "#94a3b8"}"></div>
          <div class="group-name" title="${g.name}">${g.name}</div>
          <div class="group-count">${countByGroup[g.id] ?? 0}</div>
          ${g.locked ? "" : `
            <div class="group-actions-inline">
              <button class="btn btn-ghost sm js-edit" title="Edit">✎</button>
              <button class="btn btn-ghost sm js-del" title="Delete">🗑</button>
            </div>
          `}
        `;
        item.addEventListener("click", (e) => {
          if (e.target.closest(".js-edit") || e.target.closest(".js-del")) return;
          setState({ selectedGroupId: g.id });
        });
        if (!g.locked) {
          item.querySelector(".js-edit").addEventListener("click", () => openGroupModal(g));
          item.querySelector(".js-del").addEventListener("click", () => confirmDeleteGroup(g));
        }
        list.appendChild(item);
      });
  };

  const openGroupModal = (group) => {
    const isEdit = !!group;
    const title = isEdit ? "Edit Group" : "Add Group";
    const name = isEdit ? group.name : "";
    const color = isEdit ? (group.color || "#94a3b8") : "#94a3b8";

    openModal({
      title,
      body: `
        <div class="form-row">
          <label for="grp-name">Name</label>
          <input id="grp-name" type="text" value="${name}" placeholder="e.g., Productivity" />
        </div>
        <div class="form-row">
          <label for="grp-color">Color</label>
          <input id="grp-color" type="color" value="${color}">
        </div>
      `,
      actions: [
        { label: "Cancel", className: "btn btn-ghost", onClick: closeModal },
        {
          label: isEdit ? "Save" : "Add Group",
          className: "btn",
          onClick: () => {
            const name = $("#grp-name").value.trim();
            const color = $("#grp-color").value;
            if (!name) return toast("Please enter group name");
            if (isEdit) {
              EDStorage.updateGroup(group.id, { name, color });
              toast("Group updated");
            } else {
              const id = EDStorage.addGroup({ name, color });
              setState({ selectedGroupId: id });
              toast("Group added");
            }
            closeModal();
          }
        }
      ]
    });
  };

  const confirmDeleteGroup = (group) => {
    openModal({
      title: "Delete Group",
      body: `
        <p>Delete group "<strong>${group.name}</strong>"?</p>
        <p>Services in this group will be moved to <strong>Ungrouped</strong>.</p>
      `,
      actions: [
        { label: "Cancel", className: "btn btn-ghost", onClick: closeModal },
        {
          label: "Delete",
          className: "btn btn-danger",
          onClick: () => {
            EDStorage.deleteGroup(group.id);
            setState({ selectedGroupId: "grp-ungrouped" });
            toast("Group deleted");
            closeModal();
          }
        }
      ]
    });
  };

  // Service UI
  const renderHeader = () => {
    const title = $("#current-group-title");
    const actions = $("#current-group-actions");
    const g = EDStorage.listGroups().find((x) => x.id === state.selectedGroupId);
    title.textContent = g ? g.name : "All Services";

    actions.innerHTML = "";
    if (g && !g.locked) {
      const edit = document.createElement("button");
      edit.className = "btn btn-ghost sm";
      edit.textContent = "Edit Group";
      edit.addEventListener("click", () => openGroupModal(g));
      const del = document.createElement("button");
      del.className = "btn btn-danger-outline sm";
      del.textContent = "Delete Group";
      del.addEventListener("click", () => confirmDeleteGroup(g));
      actions.appendChild(edit);
      actions.appendChild(del);
    }
  };

  const renderServices = () => {
    const grid = $("#services-grid");
    const empty = $("#empty-state");
    const services = EDStorage.listServices({ groupId: state.selectedGroupId, query: state.query });
    grid.innerHTML = "";

    if (!services.length) {
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");

    services.forEach((svc) => {
      const card = document.createElement("div");
      card.className = "card";
      const favicon = getFaviconUrl(svc.url);
      const fallbackLetter = svc.name.charAt(0).toUpperCase();
      card.innerHTML = `
        <div class="card-head">
          <div class="favicon">${favicon ? `<img src="${favicon}" alt="" width="32" height="32" />` : fallbackLetter}</div>
          <div class="card-title">
            <div class="name" title="${svc.name}">${svc.name}</div>
            <div class="url"><a href="${svc.url}" target="_blank" rel="noopener">Open ↗</a></div>
          </div>
        </div>
        ${svc.tags && svc.tags.length ? `<div class="card-tags">${svc.tags.map(t => `<span class="tag">#${t}</span>`).join("")}</div>` : ""}
        <div class="note" title="Notes">${(svc.notes || "").slice(0, 160)}</div>
        <div class="card-actions">
          <button class="btn btn-ghost sm js-note">Note</button>
          <button class="btn btn-ghost sm js-edit">Edit</button>
          <button class="btn btn-danger-outline sm js-del">Delete</button>
        </div>
      `;
      card.querySelector(".js-note").addEventListener("click", () => openNoteModal(svc));
      card.querySelector(".js-edit").addEventListener("click", () => openServiceModal(svc));
      card.querySelector(".js-del").addEventListener("click", () => confirmDeleteService(svc));
      grid.appendChild(card);
    });
  };

  const serviceFormHtml = (svc) => {
    const groups = EDStorage.listGroups().filter((g) => g.id !== "grp-all");
    const isEdit = !!svc;
    const selected = svc ? (svc.groupId || "grp-ungrouped") : "grp-ungrouped";
    const tags = (svc?.tags || []).join(", ");
    return `
      <div class="form-row">
        <label for="svc-name">Name</label>
        <input id="svc-name" type="text" value="${svc?.name || ""}" placeholder="e.g., Slack" />
      </div>
      <div class="form-row">
        <label for="svc-url">URL</label>
        <input id="svc-url" type="url" value="${svc?.url || ""}" placeholder="https://…" />
      </div>
      <div class="form-row">
        <label for="svc-group">Group</label>
        <select id="svc-group">
          ${groups.map(g => `<option value="${g.id}" ${selected === g.id ? "selected" : ""}>${g.name}</option>`).join("")}
        </select>
      </div>
      <div class="form-row">
        <label for="svc-tags">Tags (comma-separated)</label>
        <input id="svc-tags" type="text" value="${tags}" placeholder="chat, work, infra" />
      </div>
      <div class="form-row">
        <label for="svc-notes">Notes</label>
        <textarea id="svc-notes" placeholder="Add any notes…">${svc?.notes || ""}</textarea>
      </div>
    `;
  };

  const openServiceModal = (svc) => {
    const isEdit = !!svc;
    openModal({
      title: isEdit ? "Edit Service" : "Add Service",
      body: serviceFormHtml(svc),
      actions: [
        { label: "Cancel", className: "btn btn-ghost", onClick: closeModal },
        {
          label: isEdit ? "Save" : "Add Service",
          className: "btn",
          onClick: () => {
            const name = $("#svc-name").value.trim();
            const url = $("#svc-url").value.trim();
            const groupId = $("#svc-group").value;
            const tags = $("#svc-tags").value.split(",").map(s => s.trim()).filter(Boolean);
            const notes = $("#svc-notes").value;
            if (!name || !url) return toast("Name and URL are required");
            if (isEdit) {
              EDStorage.updateService(svc.id, { name, url, groupId, tags, notes });
              toast("Service updated");
            } else {
              const id = EDStorage.addService({ name, url, groupId, tags, notes });
              toast("Service added");
              if (state.selectedGroupId !== "grp-all" && state.selectedGroupId !== groupId) {
                setState({ selectedGroupId: groupId });
              }
            }
            closeModal();
          }
        }
      ]
    });
  };

  const openNoteModal = (svc) => {
    openModal({
      title: `Notes · ${svc.name}`,
      body: `
        <div class="form-row">
          <label for="svc-note-edit">Notes</label>
          <textarea id="svc-note-edit" placeholder="Write notes here…">${svc.notes || ""}</textarea>
        </div>
      `,
      actions: [
        { label: "Close", className: "btn btn-ghost", onClick: closeModal },
        {
          label: "Save Note",
          className: "btn",
          onClick: () => {
            const notes = $("#svc-note-edit").value;
            EDStorage.updateService(svc.id, { notes });
            toast("Note saved");
            closeModal();
          }
        }
      ]
    });
  };

  const confirmDeleteService = (svc) => {
    openModal({
      title: "Delete Service",
      body: `<p>Delete "<strong>${svc.name}</strong>"?</p>`,
      actions: [
        { label: "Cancel", className: "btn btn-ghost", onClick: closeModal },
        {
          label: "Delete",
          className: "btn btn-danger",
          onClick: () => {
            EDStorage.deleteService(svc.id);
            toast("Service deleted");
            closeModal();
          }
        }
      ]
    });
  };

  // Topbar bindings
  const bindTopbar = () => {
    $("#btn-add-group").addEventListener("click", () => openGroupModal());
    $("#btn-add-service").addEventListener("click", () => openServiceModal());
    $("#btn-export").addEventListener("click", () => EDStorage.exportConfig());

    const fileInput = $("#file-input");
    $("#btn-import").addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      try {
        const text = await EDUtils.readFileAsText(f);
        await EDStorage.importFromText(text);
        toast("Config imported");
      } catch (err) {
        console.error(err);
        toast("Failed to import config");
      } finally {
        fileInput.value = "";
      }
    });

    // Theme toggle
    $("#btn-theme").addEventListener("click", () => {
      const root = document.documentElement;
      const isLight = root.classList.contains("light");
      const next = isLight ? "dark" : "light";
      applyTheme(next);
      EDStorage.setTheme(next);
      toast(`Theme: ${next}`);
    });

    // Search
    const onSearch = debounce((e) => setState({ query: e.target.value.trim() }), 150);
    const searchInput = $("#search-input");
    searchInput.addEventListener("input", onSearch);
    searchInput.value = state.query;
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.classList.remove("light");
    if (theme === "light") root.classList.add("light");
  };

  const render = () => {
    renderGroups();
    renderHeader();
    renderServices();
  };

  const init = () => {
    // Load hash state
    readHash();
    bindTopbar();

    // Listen to changes
    EDStorage.on((_cfg) => {
      const theme = EDStorage.getTheme();
      applyTheme(theme);
      render();
    });

    // Navigation via hash changes (back/forward)
    window.addEventListener("hashchange", () => {
      readHash();
      render();
    });

    // Initial theme and first render
    applyTheme(EDStorage.getTheme());
    render();
  };

  window.EDUI = { init, setState, openGroupModal, openServiceModal };
})();
