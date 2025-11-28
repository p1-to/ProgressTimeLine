// =================================================================
// グローバル変数
// =================================================================
let records = []; 
let currentIndex = 0; 
let slideInterval = null; 
let db = null; // データベース接続用

// =================================================================
// IndexedDB (データベース) 関連の関数
// =================================================================

// データベースを開く
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('EvoluDB', 1);

        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('records')) {
                db.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
            }
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = function(event) {
            console.error('Database error:', event.target.error);
            reject('データベースを開けませんでした');
        };
    });
}

// データを追加保存する
function addRecordToDB(record) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['records'], 'readwrite');
        const store = transaction.objectStore('records');
        const request = store.add(record);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// 全データを読み込む
function getAllRecordsFromDB() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['records'], 'readonly');
        const store = transaction.objectStore('records');
        const request = store.getAll();

        request.onsuccess = () => {
            let loadedData = request.result;
            loadedData.sort((a, b) => new Date(a.date) - new Date(b.date));
            resolve(loadedData);
        };
        request.onerror = () => reject(request.error);
    });
}

// データを1件削除する
function deleteRecordFromDB(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['records'], 'readwrite');
        const store = transaction.objectStore('records');
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ★追加：全データを削除する（クリア）
function clearAllRecordsInDB() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['records'], 'readwrite');
        const store = transaction.objectStore('records');
        const request = store.clear(); // 全削除コマンド

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

function formatDate(dateObj) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}


// =================================================================
// ページの初期化処理
// =================================================================
window.onload = async function() { 

    // HTML部品の取得
    const mainImage = document.getElementById('mainImage');
    const recordDate = document.getElementById('recordDate');
    const recordMemo = document.getElementById('recordMemo');
    
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const deleteButton = document.getElementById('deleteButton');
    // ★追加
    const deleteAllButton = document.getElementById('deleteAllButton');

    const playPauseButton = document.getElementById('playPauseButton');
    const timeInput = document.getElementById('timeInput');
    
    const plus1sButton = document.getElementById('plus1sButton');
    const minus1sButton = document.getElementById('minus1sButton');
    const plus01sButton = document.getElementById('plus01sButton');
    const minus01sButton = document.getElementById('minus01sButton');

    const recordForm = document.getElementById('recordForm');
    const dateInput = document.getElementById('dateInput');
    const memoInput = document.getElementById('memoInput');
    const imageInput = document.getElementById('imageInput');

    dateInput.value = formatDate(new Date());

    // DB初期化
    try {
        await openDB(); 
        records = await getAllRecordsFromDB(); 
        currentIndex = records.length > 0 ? records.length - 1 : 0;
        updateDisplay();
    } catch (error) {
        alert('データベースエラー: ' + error);
    }

    // --- 関数群 ---

    function updateDisplay() {
        if (records.length === 0) {
            mainImage.src = ''; 
            mainImage.alt = 'データを追加してください';
            mainImage.style.opacity = '0.3'; 
            recordDate.textContent = '---';
            recordMemo.textContent = 'データを追加してください。';
            return; 
        }
        
        mainImage.style.opacity = '1';

        if (currentIndex >= records.length) currentIndex = records.length - 1;
        if (currentIndex < 0) currentIndex = 0;
        
        const currentRecord = records[currentIndex]; 
        mainImage.src = currentRecord.image;
        recordDate.textContent = currentRecord.date;
        recordMemo.textContent = currentRecord.memo;
    }

    function showNextRecord() {
        if (records.length === 0) return; 
        currentIndex++;
        if (currentIndex >= records.length) currentIndex = 0;
        updateDisplay();
    }

    function stopSlideshow() {
        if (slideInterval !== null) {
            clearInterval(slideInterval);
            slideInterval = null;
            playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
            playPauseButton.classList.remove('pause-button');
            playPauseButton.classList.add('play-button');
        }
    }

    function startSlideshow() {
        if (records.length <= 1) return;
        stopSlideshow(); 

        const seconds = parseFloat(timeInput.value); 
        const intervalTime = seconds * 1000;

        if (intervalTime < 100 || isNaN(intervalTime)) {
            alert('切り替え時間は0.1秒以上を指定してください。');
            timeInput.value = '3.0'; 
            return;
        }

        playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
        playPauseButton.classList.remove('play-button');
        playPauseButton.classList.add('pause-button');

        slideInterval = setInterval(showNextRecord, intervalTime); 
    }

    function updateTimeInput(change) {
        let currentValue = parseFloat(timeInput.value);
        let newValue = currentValue + change;
        if (newValue < 0.1) newValue = 0.1;
        timeInput.value = newValue.toFixed(1);
    }

    // --- イベントリスナー ---

    imageInput.addEventListener('change', function(e) {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (file.lastModified) {
                dateInput.value = formatDate(new Date(file.lastModified));
            }
        }
    });

    nextButton.addEventListener('click', () => { stopSlideshow(); showNextRecord(); });
    prevButton.addEventListener('click', () => {
        stopSlideshow(); 
        if (records.length === 0) return; 
        currentIndex--;
        if (currentIndex < 0) currentIndex = records.length - 1;
        updateDisplay();
    });
    playPauseButton.addEventListener('click', () => {
        if (slideInterval === null) startSlideshow();
        else stopSlideshow();
    });

    plus1sButton.addEventListener('click', () => { updateTimeInput(1.0); stopSlideshow(); });
    minus1sButton.addEventListener('click', () => { updateTimeInput(-1.0); stopSlideshow(); });
    plus01sButton.addEventListener('click', () => { updateTimeInput(0.1); stopSlideshow(); });
    minus01sButton.addEventListener('click', () => { updateTimeInput(-0.1); stopSlideshow(); });

    // 1件削除
    deleteButton.addEventListener('click', async () => {
        if (records.length === 0) return;
        const currentRecord = records[currentIndex];
        
        if (!confirm(`日付: ${currentRecord.date}\nこの記録を削除しますか？`)) return;

        try {
            await deleteRecordFromDB(currentRecord.id);
            records.splice(currentIndex, 1);
            alert('削除しました。');
            updateDisplay();
        } catch (e) {
            alert('削除失敗: ' + e);
        }
    });

    // ★追加：全件削除ボタンの処理
    deleteAllButton.addEventListener('click', async () => {
        if (records.length === 0) return;

        // 安全のため2回確認する
        if (!confirm('【警告】\n保存されている全てのデータを削除しますか？\nこの操作は取り消せません。')) return;
        if (!confirm('本当に全てのデータを消去してよろしいですか？')) return;

        try {
            // DBを空にする
            await clearAllRecordsInDB();
            
            // 画面側のデータもリセット
            records = [];
            currentIndex = 0;
            
            alert('全てのデータを削除しました。');
            updateDisplay();

        } catch (e) {
            alert('全削除に失敗しました: ' + e);
        }
    });

    // 保存処理
    recordForm.addEventListener('submit', async (event) => {
        event.preventDefault(); 
        
        const inputFiles = imageInput.files;
        const memo = memoInput.value;
        const manualDate = dateInput.value; 

        if (inputFiles.length === 0) {
            alert('画像を選択してください。');
            return;
        }

        const saveBtn = recordForm.querySelector('.save-button');
        const originalBtnText = saveBtn.textContent;
        saveBtn.textContent = '保存中...';
        saveBtn.disabled = true;

        // 1枚のファイルを読み込んでデータ化する関数
        const processFile = (file) => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    
                    let recordDate;

                    // ★ここを修正: スマートな日付決定ロジック
                    if (inputFiles.length > 1 && file.lastModified) {
                        // 複数枚あるなら、それぞれの「撮影日」を優先（履歴の一括登録などのため）
                        recordDate = formatDate(new Date(file.lastModified));
                    } else {
                        // 1枚だけなら、ユーザーが画面で指定した「入力欄の日付」を優先
                        recordDate = manualDate;
                    }

                    resolve({
                        image: e.target.result, 
                        date: recordDate,       
                        memo: memo              
                    });
                };
                reader.readAsDataURL(file);
            });
        };

        try {
            const promises = Array.from(inputFiles).map(file => processFile(file));
            const newRecordsData = await Promise.all(promises);

            for (let data of newRecordsData) {
                const newId = await addRecordToDB(data);
                data.id = newId;
                records.push(data);
            }

            records.sort((a, b) => new Date(a.date) - new Date(b.date));
            currentIndex = records.length - 1;
            updateDisplay();
            
            recordForm.reset();
            dateInput.value = formatDate(new Date());
            
            alert(`${newRecordsData.length}枚保存しました！`);

        } catch (error) {
            console.error(error);
            alert('保存エラー: ' + error);
        } finally {
            saveBtn.textContent = originalBtnText;
            saveBtn.disabled = false;
        }
    });
};