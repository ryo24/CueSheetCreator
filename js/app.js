// app.js
console.log("CueSheetCreator initialized");

let state = {
  eventName: "",
  programs: []
};
let imageCache = {};
let activeProgramId = null;

function generateId(prefix) {
  return prefix + '-' + Math.random().toString(36).substr(2, 9);
}

function sanitizeFilenamePart(value, fallback) {
  const trimmed = (value || '').trim();
  if (!trimmed) return fallback;
  return trimmed.replace(/[\\/:*?"<>|]/g, '_');
}

function formatDateForFilename(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function updateDocumentTitle(activeProg, date) {
  const eventName = sanitizeFilenamePart(state.eventName, 'UntitledEvent');
  const programName = sanitizeFilenamePart(activeProg ? activeProg.name : '', 'Program');
  const formattedDate = formatDateForFilename(date);
  document.title = `${eventName}-${programName}-${formattedDate}`;
}

function saveLocal() {
  try {
    localStorage.setItem('qcreator_state', JSON.stringify(state));
    localStorage.setItem('qcreator_images', JSON.stringify(imageCache));
  } catch(e) {
    console.warn("Storage quota exceeded, images might not be cached.");
  }
}

async function exportCueSheet() {
  if(!window.JSZip) {
    alert("ZIPライブラリがロードされていません");
    return;
  }

  const zip = new JSZip();
  zip.file("data.json", JSON.stringify(state, null, 2));
  const imgFolder = zip.folder("images");
  for (const [imgId, dataUrl] of Object.entries(imageCache)) {
    if(!dataUrl) continue;
    const base64Data = dataUrl.split(',')[1];
    if(base64Data) imgFolder.file(`${imgId}.jpg`, base64Data, {base64: true});
  }

  const content = await zip.generateAsync({type: "blob"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(content);
  a.download = `${sanitizeFilenamePart(state.eventName, "cuesheet")}.cuesheet`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function render() {
  if(!activeProgramId && state.programs.length > 0) activeProgramId = state.programs[0].id;

  const eventInput = document.getElementById('event-name');
  if(document.activeElement !== eventInput) {
    eventInput.value = state.eventName;
  }
  
  const d = new Date();
  document.getElementById('print-date').textContent = d.toLocaleString();
  document.getElementById('print-event-name').textContent = "EVENT: " + (state.eventName || "Untitled");

  const sidebarList = document.getElementById('sidebar-program-list');
  sidebarList.innerHTML = '';
  state.programs.forEach(prog => {
    let li = document.createElement('li');
    let span = document.createElement('span');
    span.textContent = prog.name || '無題のプログラム';
    li.appendChild(span);
    
    let delBtn = document.createElement('button');
    delBtn.innerHTML = '×';
    delBtn.className = 'btn-sidebar-delete';
    delBtn.title = 'セクション削除';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      if(state.programs.length <= 1) return alert('最後のプログラムは削除できません');
      if(confirm(`プログラム「${prog.name}」を削除しますか？`)) {
         state.programs = state.programs.filter(p => p.id !== prog.id);
         if(activeProgramId === prog.id) activeProgramId = state.programs[0].id;
         render();
      }
    };
    li.appendChild(delBtn);

    if(prog.id === activeProgramId) li.classList.add('active');
    li.onclick = () => { activeProgramId = prog.id; render(); };
    sidebarList.appendChild(li);
  });
  
  const activeProg = state.programs.find(p => p.id === activeProgramId);
  const tbody = document.getElementById('active-program-scenes');
  
  if(!activeProg) {
     updateDocumentTitle(null, d);
     document.getElementById('active-program-name').value = '';
     document.getElementById('print-program-name').textContent = "PROGRAM: ";
     tbody.innerHTML = '';
     return;
  }
  
  const progNameInput = document.getElementById('active-program-name');
  if(document.activeElement !== progNameInput) {
    progNameInput.value = activeProg.name;
  }
  updateDocumentTitle(activeProg, d);
  document.getElementById('print-program-name').textContent = "PROGRAM: " + activeProg.name;
  
  tbody.innerHTML = '';
  const sceneTpl = document.getElementById('tpl-scene').content;
  
  activeProg.scenes.forEach((scene, sIndex) => {
      let sceneClone = document.importNode(sceneTpl, true);
      
      const bindStr = (sel, field) => {
        let el = sceneClone.querySelector(sel);
        if(el) {
          el.value = scene[field] || '';
          el.addEventListener('input', (e) => { scene[field] = e.target.value; });
        }
      };
      
      bindStr('.inp-number', 'number');
      bindStr('.inp-title', 'title');
      bindStr('.inp-desc', 'desc');
      bindStr('.inp-lighting', 'lighting');
      bindStr('.inp-memo', 'memo');

      sceneClone.querySelector('.btn-delete-scene').addEventListener('click', () => {
        if(confirm('シーンを削除しますか？')) {
          activeProg.scenes.splice(sIndex, 1);
          // 自動連番ふり直し
          activeProg.scenes.forEach((s, idx) => s.number = String(idx + 1).padStart(2, '0'));
          render();
        }
      });
      
      let dropArea = sceneClone.querySelector('.image-drop-area');
      let imgEl = sceneClone.querySelector('.scene-img');
      let dropText = sceneClone.querySelector('.drop-text');
      let removeBtn = sceneClone.querySelector('.btn-remove-image');

      if (scene.imageId && imageCache[scene.imageId]) {
        imgEl.src = imageCache[scene.imageId];
        imgEl.classList.remove('hidden');
        dropText.classList.add('hidden');
        removeBtn.classList.remove('hidden');
        dropArea.style.border = 'none';
      }

      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        scene.imageId = null;
        render();
      });

      dropArea.addEventListener('dragover', (e) => { e.preventDefault(); dropArea.classList.add('dragover'); });
      dropArea.addEventListener('dragleave', () => dropArea.classList.remove('dragover'));
      dropArea.addEventListener('drop', (e) => {
        e.preventDefault(); dropArea.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) processImage(e.dataTransfer.files[0], scene.id, () => render());
      });
      dropArea.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-remove-image')) return;
        let fileInput = document.createElement('input');
        fileInput.type = 'file'; fileInput.accept = 'image/*';
        fileInput.onchange = (ev) => { if (ev.target.files && ev.target.files[0]) processImage(ev.target.files[0], scene.id, () => render()); };
        fileInput.click();
      });

      tbody.appendChild(sceneClone);
  });
  
  if (window.Sortable) {
      new Sortable(tbody, {
        handle: '.drag-handle',
        animation: 150,
        onEnd: function (evt) {
          if(evt.oldIndex !== evt.newIndex) {
            let item = activeProg.scenes.splice(evt.oldIndex, 1)[0];
            activeProg.scenes.splice(evt.newIndex, 0, item);
            // 並び替え完了時に自動で連番を振り直す
            activeProg.scenes.forEach((s, idx) => s.number = String(idx + 1).padStart(2, '0'));
            render();
          }
        }
      });
  }
  saveLocal();
}

function processImage(file, sceneId, callback) {
  if (!file.type.match('image.*')) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    let img = new Image();
    img.onload = () => {
      const MAX_WIDTH = 800;
      let width = img.width;
      let height = img.height;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }
      let canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      let ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      let dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      for (let p of state.programs) {
        let s = p.scenes.find(x => x.id === sceneId);
        if (s) {
          let newImageId = generateId('img');
          imageCache[newImageId] = dataUrl;
          s.imageId = newImageId;
          break;
        }
      }
      callback();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('event-name').addEventListener('input', (e) => {
    state.eventName = e.target.value;
    document.getElementById('print-event-name').textContent = "EVENT: " + (state.eventName || "Untitled");
  });

  document.getElementById('active-program-name').addEventListener('input', (e) => {
    if(activeProgramId) {
      let prog = state.programs.find(p => p.id === activeProgramId);
      if(prog) prog.name = e.target.value;
      const activeLi = document.querySelector('#sidebar-program-list li.active span');
      if(activeLi) activeLi.textContent = e.target.value || '無題のプログラム';
    }
  });

  document.getElementById('btn-add-program').addEventListener('click', () => {
    let newId = generateId('p');
    state.programs.push({
      id: newId,
      name: '新規プログラム',
      scenes: []
    });
    activeProgramId = newId;
    render();
  });

  function addSceneToActive() {
     if(!activeProgramId) return;
     let prog = state.programs.find(p => p.id === activeProgramId);
     if(prog) {
        let nextNum = String(prog.scenes.length + 1).padStart(2, '0');
        prog.scenes.push({ id: generateId('s'), number: nextNum, title: '', desc: '', imageId: null, lighting: '', memo: '' });
        render();
     }
  }

  document.getElementById('btn-add-scene-bottom').addEventListener('click', addSceneToActive);
  
  document.getElementById('btn-export').addEventListener('click', () => {
    exportCueSheet();
  });

  document.addEventListener('keydown', (e) => {
    const isSaveShortcut = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's';
    if (!isSaveShortcut) return;

    e.preventDefault();
    exportCueSheet();
  });

  document.getElementById('inp-import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if(!window.JSZip) { alert("ZIPライブラリがロードされていません"); return; }
    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      const jsonStr = await loadedZip.file("data.json").async("string");
      state = JSON.parse(jsonStr);
      imageCache = {};
      
      for(const [filename, fileObj] of Object.entries(loadedZip.files)) {
         if(!fileObj.dir && filename.startsWith('images/')) {
            const imgId = filename.replace('images/', '').replace('.jpg', '');
            const base64Data = await fileObj.async("base64");
            imageCache[imgId] = "data:image/jpeg;base64," + base64Data;
         }
      }
      if(state.programs.length > 0) activeProgramId = state.programs[0].id;
      render();
    } catch (err) {
      alert("読み込みに失敗しました。不正なファイル(.cuesheet)です。: " + err);
    }
    e.target.value = '';
  });

  // ヘルプモーダル制御
  document.getElementById('btn-help').addEventListener('click', () => {
    document.getElementById('help-modal').classList.remove('hidden');
  });
  document.getElementById('btn-close-help').addEventListener('click', () => {
    document.getElementById('help-modal').classList.add('hidden');
  });
  document.getElementById('help-modal').addEventListener('click', (e) => {
    if(e.target === document.getElementById('help-modal')) {
      document.getElementById('help-modal').classList.add('hidden');
    }
  });

  // LocalStorageからの復元
  const savedState = localStorage.getItem('qcreator_state');
  const savedImages = localStorage.getItem('qcreator_images');
  if (savedState) {
    try {
       state = JSON.parse(savedState);
       if(savedImages) imageCache = JSON.parse(savedImages);
       if(state.programs.length > 0) activeProgramId = state.programs[0].id;
    } catch(e){}
  }

  // 初期データを持たない場合は完全な空のプログラムを1つ確保
  if(state.programs.length === 0) {
    let pId = generateId('p');
    state.programs.push({
      id: pId,
      name: '新規プログラム',
      scenes: [
        { id: generateId('s'), number: '01', title: '', desc: '', imageId: null, lighting: '', memo: '' }
      ]
    });
    activeProgramId = pId;
  }

  render();
});
