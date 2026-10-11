const rules = [
  { name: 'Documents', extensions: ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'], tone: 'mint' },
  { name: 'Images', extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'], tone: 'yellow' },
  { name: 'Videos', extensions: ['.mp4', '.mov', '.avi', '.mkv'], tone: 'blue' },
  { name: 'Audio', extensions: ['.mp3', '.wav', '.m4a', '.flac'], tone: 'coral' },
  { name: 'Archives', extensions: ['.zip', '.rar', '.7z', '.tar', '.gz'], tone: 'slate' },
  { name: 'Applications', extensions: ['.dmg', '.exe', '.pkg', '.app'], tone: 'teal' },
  { name: 'Presentations', extensions: ['.ppt', '.pptx', '.key'], tone: 'purple' },
  { name: 'Other', extensions: [], tone: 'gray' }
];

const sampleFiles = [
  { name: 'Q4-roadmap-final.pdf', size: '2.4 MB', folder: 'Documents' },
  { name: 'IMG_4821.jpg', size: '4.8 MB', folder: 'Images' },
  { name: 'team-offsite-2024.mp4', size: '128 MB', folder: 'Videos' },
  { name: 'invoice_00821.pdf', size: '860 KB', folder: 'Documents' },
  { name: 'brand-assets.zip', size: '24.1 MB', folder: 'Archives' },
  { name: 'voice-note.m4a', size: '3.2 MB', folder: 'Audio' }
].map((file, index) => ({ ...file, id: index + 1, selected: true, sorted: false }));

let files = [...sampleFiles];
const fileList = document.querySelector('#file-list');
const emptyState = document.querySelector('#empty-state');
const selectAll = document.querySelector('#select-all');
const sortButton = document.querySelector('#sort-button');
const selectedCount = document.querySelector('#selected-count');
const visibleCount = document.querySelector('#visible-count');
const queueDescription = document.querySelector('#queue-description');
const dropZone = document.querySelector('#drop-zone');
const toast = document.querySelector('#toast');
let toastTimer;

function extensionOf(name) {
  const dot = name.lastIndexOf('.');
  return dot > -1 ? name.slice(dot).toLowerCase() : '';
}

function ruleFor(name) {
  const extension = extensionOf(name);
  return rules.find((rule) => rule.extensions.includes(extension)) || rules[rules.length - 1];
}

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function iconClass(folder) {
  if (folder === 'Images') return 'image';
  if (folder === 'Videos') return 'video';
  return '';
}

function renderFiles() {
  fileList.innerHTML = '';
  emptyState.classList.toggle('hidden', files.length > 0);
  files.forEach((file) => {
    const rule = ruleFor(file.name);
    const extension = extensionOf(file.name).replace('.', '').toUpperCase() || 'FILE';
    const row = document.createElement('div');
    row.className = 'file-row';
    row.innerHTML = `
      <label class="file-name">
        <input class="row-check" type="checkbox" data-id="${file.id}" ${file.selected ? 'checked' : ''} />
        <span class="custom-check"></span>
        <span class="file-icon ${iconClass(rule.name)}">${extension.slice(0, 4)}</span>
        <span title="${file.name}">${file.name}</span>
      </label>
      <span class="file-type">${extension.toLowerCase()}</span>
      <span class="file-size">${file.size}</span>
      <span class="destination"><i class="folder-dot"></i>${rule.name}</span>
      <span class="status-cell"><span class="status-pill ${file.sorted ? 'sorted' : ''}">${file.sorted ? 'sorted' : 'ready'}</span></span>`;
    row.querySelector('.row-check').addEventListener('change', (event) => {
      file.selected = event.target.checked;
      updateControls();
    });
    fileList.appendChild(row);
  });
  visibleCount.textContent = files.length;
  selectAll.checked = files.length > 0 && files.every((file) => file.selected);
  updateControls();
}

function updateControls() {
  const count = files.filter((file) => file.selected && !file.sorted).length;
  selectedCount.textContent = count;
  sortButton.disabled = count === 0;
  queueDescription.textContent = files.length ? `${files.length} files ready for a tidy-up` : 'A sample workspace is waiting for you';
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function loadFiles(fileListInput) {
  const incoming = Array.from(fileListInput).filter((file) => file.name && !file.name.startsWith('.'));
  if (!incoming.length) {
    showToast('No visible files found in that folder.');
    return;
  }
  files = incoming.map((file, index) => ({ name: file.name, size: formatSize(file.size), id: Date.now() + index, selected: true, sorted: false }));
  renderFiles();
  showToast(`${files.length} files mapped and ready to sort.`);
}

selectAll.addEventListener('change', () => {
  files.forEach((file) => { file.selected = selectAll.checked; });
  renderFiles();
});

document.querySelector('#folder-input').addEventListener('change', (event) => loadFiles(event.target.files));
document.querySelector('#demo-button').addEventListener('click', () => {
  files = sampleFiles.map((file) => ({ ...file, selected: true, sorted: false }));
  renderFiles();
  showToast('Sample workspace loaded. Six files are ready.');
});
document.querySelector('#clear-button').addEventListener('click', () => {
  files = [];
  renderFiles();
  showToast('Queue cleared.');
});
sortButton.addEventListener('click', () => {
  let sortedNow = 0;
  files.forEach((file) => {
    if (file.selected && !file.sorted) { file.sorted = true; sortedNow += 1; }
  });
  renderFiles();
  if (sortedNow) showToast(`${sortedNow} ${sortedNow === 1 ? 'file' : 'files'} sorted into destination folders.`);
});

['dragenter', 'dragover'].forEach((eventName) => dropZone.addEventListener(eventName, (event) => { event.preventDefault(); dropZone.classList.add('dragging'); }));
['dragleave', 'drop'].forEach((eventName) => dropZone.addEventListener(eventName, (event) => { event.preventDefault(); dropZone.classList.remove('dragging'); }));
dropZone.addEventListener('drop', (event) => loadFiles(event.dataTransfer.files));

document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => {
  const viewName = button.dataset.view;
  document.querySelectorAll('.page-view').forEach((view) => view.classList.remove('active-view'));
  document.querySelector(`#${viewName}-view`).classList.add('active-view');
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === viewName));
}));

function renderRules() {
  document.querySelector('#rules-grid').innerHTML = rules.map((rule) => `<article class="rule-card"><span class="rule-folder"></span><div><h3>${rule.name}</h3><p>${rule.extensions.length ? rule.extensions.join('  ') : 'everything else'}</p></div><span class="rule-arrow">-></span></article>`).join('');
}

document.querySelector('#activity-list').innerHTML = [
  ['6 files sorted', 'Documents, Images, Videos, Archives', 'Today, 9:42 AM'],
  ['14 files sorted', 'Documents, Images, Audio', 'Yesterday, 4:18 PM'],
  ['3 files sorted', 'Videos', 'Oct 08, 11:06 AM']
].map(([title, detail, time]) => `<div class="activity-item"><span class="activity-mark">✓</span><div><strong>${title}</strong><small>${detail}</small></div><span class="activity-time">${time}</span></div>`).join('');

renderRules();
renderFiles();
