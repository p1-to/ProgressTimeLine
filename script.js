// =================================================================
// 状態管理用変数（ステート）
// =================================================================
let records = [];       // 記録データの配列
let currentIndex = 0;   // 現在表示している画像のインデックス
let slideInterval = null; // 自動再生のタイマーID

// =================================================================
// ページ読み込み完了時に実行されるメイン処理
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // ------------------------------
    // 1. HTML要素の取得
    // ------------------------------
    const els = {
        // 表示エリア
        mainImage: document.getElementById('mainImage'),
        recordDate: document.getElementById('recordDate'),
        recordMemo: document.getElementById('recordMemo'),
        
        // コントロール
        prevBtn: document.getElementById('prevButton'),
        nextBtn: document.getElementById('nextButton'),
        playPauseBtn: document.getElementById('playPauseButton'),
        deleteBtn: document.getElementById('deleteButton'),
        
        // 時間設定
        timeInput: document.getElementById('timeInput'),
        btnsTime: {
            p1: document.getElementById('plus1sButton'),
            m1: document.getElementById('minus1sButton'),
            p01: document.getElementById('plus01sButton'),
            m01: document.getElementById('minus01sButton'),
        },

        // フォーム
        form: document.getElementById('recordForm'),
        inputs: {
            date: document.getElementById('dateInput'),
            memo: document.getElementById('memoInput'),
            image: document.getElementById('imageInput')
        }
    };

    // ------------------------------
    // 2. 初期化処理
    // ------------------------------
    loadRecords(); // データの読み込み
    updateDisplay(); // 画面の更新

    // ------------------------------
    // 3. イベントリスナーの登録
    // ------------------------------

    // 前へ・次へボタン
    els.prevBtn.addEventListener('click', () => {
        stopSlideshow();
        changeIndex(-1);
    });
    els.nextBtn.addEventListener('click', () => {
        stopSlideshow();
        changeIndex(1);
    });

    // 自動再生ボタン
    els.playPauseBtn.addEventListener('click', toggleSlideshow);

    // 時間調整ボタン（+0.1sなど）
    els.btnsTime.p1.addEventListener('click', () => updateTimeInput(1.0));
    els.btnsTime.m1.addEventListener('click', () => updateTimeInput(-1.0));
    els.btnsTime.p01.addEventListener('click', () => updateTimeInput(0.1));
    els.btnsTime.m01.addEventListener('click', () => updateTimeInput(-0.1));

    // 削除ボタン
    els.deleteBtn.addEventListener('click', deleteCurrentRecord);

    // 保存フォーム
    els.form.addEventListener('submit', handleSave);


    // =================================================================
    // 関数定義エリア
    // =================================================================

    // --- データ操作系 ---

    // LocalStorageから読み込み
    function loadRecords() {
        const json = localStorage.getItem('muscleRecords');
        if (json) {
            records = JSON.parse(json);
            // 日付順にソート（古い順）
            records.sort((a, b) => new Date(a.date) - new Date(b.date));
            // 最新を表示するために末尾にインデックスを合わせる
            currentIndex = records.length > 0 ? records.length - 1 : 0;
        } else {
            records = [];
            currentIndex = 0;
        }
    }

    // LocalStorageへ保存
    function saveRecords() {
        localStorage.setItem('muscleRecords', JSON.stringify(records));
    }

    // --- 表示更新系 ---

    function updateDisplay() {
        if (records.length === 0) {
            // データがない場合
            els.mainImage.src = ''; 
            els.mainImage.alt = 'データがありません';
            // 表示用のダミー画像や色を設定しても良い
            els.mainImage.style.backgroundColor = '#ccc';
            
            els.recordDate.textContent = '---';
            els.recordMemo.textContent = 'フォームから新しい記録を追加してください。';
            return;
        }

        // インデックスの安全装置
        if (currentIndex >= records.length) currentIndex = records.length - 1;
        if (currentIndex < 0) currentIndex = 0;

        const data = records[currentIndex];

        // 画像とテキストの更新
        els.mainImage.src = data.image;
        els.mainImage.alt = data.memo;
        els.mainImage.style.backgroundColor = '#000'; // 画像ありの場合は黒背景
        els.recordDate.textContent = data.date;
        els.recordMemo.textContent = data.memo;
    }

    function changeIndex(step) {
        if (records.length === 0) return;
        
        currentIndex += step;
        
        // ループさせる処理
        if (currentIndex >= records.length) {
            currentIndex = 0;
        } else if (currentIndex < 0) {
            currentIndex = records.length - 1;
        }
        
        updateDisplay();
    }

    // --- 時間操作系 ---
    
    function updateTimeInput(val) {
        stopSlideshow(); // 時間を変えたら一旦停止
        let current = parseFloat(els.timeInput.value);
        let next = current + val;
        
        // 0.1未満にならないように
        if (next < 0.1) next = 0.1;
        
        // 小数点のブレを防ぐ（例: 3.10000002 -> 3.1）
        els.timeInput.value = Math.round(next * 10) / 10;
    }

    // --- スライドショー機能 ---

    function toggleSlideshow() {
        if (slideInterval) {
            stopSlideshow();
        } else {
            startSlideshow();
        }
    }

    function startSlideshow() {
        if (records.length <= 1) return; // 1枚以下なら再生しない

        const sec = parseFloat(els.timeInput.value);
        if (sec < 0.1 || isNaN(sec)) {
            alert('有効な時間を設定してください');
            return;
        }

        // ボタンの見た目変更
        els.playPauseBtn.textContent = '⏸ 停止';
        els.playPauseBtn.classList.add('pause-button');
        els.playPauseBtn.classList.remove('play-button');

        // タイマーセット
        slideInterval = setInterval(() => {
            changeIndex(1);
        }, sec * 1000);
    }

    function stopSlideshow() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
        // ボタンの見た目を戻す
        els.playPauseBtn.textContent = '▶ 自動再生';
        els.playPauseBtn.classList.add('play-button');
        els.playPauseBtn.classList.remove('pause-button');
    }

    // --- 削除・保存機能 ---

    function deleteCurrentRecord() {
        if (records.length === 0) return;

        const confirmMsg = `日付: ${records[currentIndex].date}\nこの記録を削除しますか？`;
        if (!confirm(confirmMsg)) return;

        // 配列から削除
        records.splice(currentIndex, 1);
        saveRecords();
        
        // インデックス調整（削除した後、前の画像を表示するか次の画像を表示するか）
        if (currentIndex >= records.length) {
            currentIndex = records.length - 1;
        }
        
        alert('削除しました。');
        updateDisplay();
    }

    function handleSave(e) {
        e.preventDefault(); // フォーム送信によるリロードを防ぐ

        const file = els.inputs.image.files[0];
        if (!file) {
            alert('画像を選択してください');
            return;
        }

        // 画像をBase64テキストに変換して保存
        const reader = new FileReader();
        reader.onload = function(event) {
            const newRecord = {
                date: els.inputs.date.value,
                memo: els.inputs.memo.value,
                image: event.target.result // Base64データ
            };

            records.push(newRecord);
            // 日付順にソートしなおす
            records.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            saveRecords();
            
            // 追加した画像を表示（最新の日付なら末尾へ）
            // 簡易的に末尾を表示するように変更しても良いが、
            // ここでは日付ソート後の位置を探すのが手間なので、末尾を表示する形にします
            currentIndex = records.indexOf(newRecord); 
            
            updateDisplay();
            
            // フォームのリセット
            els.form.reset();
            alert('画像が保存されました！');
        };

        reader.readAsDataURL(file);
    }

});